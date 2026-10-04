import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, Platform, StyleProp, View, ViewStyle } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { Fonts } from '@/constants/theme';
import { FigureNode } from '@/components/measure/figure';

interface FigureViewProps {
  nodes: FigureNode[];
  /** Drawing grid. */
  view: { x: number; w: number; h: number };
  /** Point to centre and zoom level; omit for the whole drawing. */
  focus?: { cx: number; cy: number; s: number } | null;
  style?: StyleProp<ViewStyle>;
}

// Draws figure nodes fitted into whatever space it is given, and glides (zoom + pan) to
// the focus point when it changes.
export function FigureView({ nodes, view, focus, style }: FigureViewProps) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const scale = useRef(new Animated.Value(1)).current;
  const tx = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;
  const f = focus ?? { cx: view.x + view.w / 2, cy: view.h / 2, s: 1 };

  useEffect(() => {
    if (!size.w || !size.h) return;
    const k = Math.min(size.w / view.w, size.h / view.h);
    const offX = (size.w - view.w * k) / 2;
    const offY = (size.h - view.h * k) / 2;
    const px = offX + (f.cx - view.x) * k;
    const py = offY + f.cy * k;
    const native = Platform.OS !== 'web';
    const anim = (v: Animated.Value, to: number) =>
      Animated.timing(v, { toValue: to, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: native });
    Animated.parallel([
      anim(scale, f.s),
      anim(tx, -f.s * (px - size.w / 2)),
      anim(ty, -f.s * (py - size.h / 2)),
    ]).start();
  }, [f.cx, f.cy, f.s, size.w, size.h, view.x, view.w, view.h, scale, tx, ty]);

  const onLayout = (e: LayoutChangeEvent) =>
    setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });

  return (
    <View style={[{ overflow: 'hidden' }, style]} onLayout={onLayout} pointerEvents="none">
      {size.w > 0 && size.h > 0 && (
        <Animated.View style={{ width: size.w, height: size.h, transform: [{ translateX: tx }, { translateY: ty }, { scale }] }}>
          <Svg width={size.w} height={size.h} viewBox={`${view.x} 0 ${view.w} ${view.h}`}>
            {nodes.map(renderNode)}
          </Svg>
        </Animated.View>
      )}
    </View>
  );
}

export function renderNode(n: FigureNode, i: number) {
  switch (n.k) {
    case 'path':
      return <Path key={i} d={n.d} fill={n.fill ?? 'none'} stroke={n.stroke} strokeWidth={n.sw} strokeLinejoin="round" />;
    case 'circle':
      return <Circle key={i} cx={n.cx} cy={n.cy} r={n.r} fill={n.fill ?? 'none'} stroke={n.stroke} strokeWidth={n.sw} />;
    case 'line':
      return (
        <Line
          key={i}
          x1={n.x1}
          y1={n.y1}
          x2={n.x2}
          y2={n.y2}
          stroke={n.stroke}
          strokeWidth={n.sw}
          strokeDasharray={n.dash ? n.dash.join(' ') : undefined}
        />
      );
    case 'text': {
      const common = {
        x: n.x,
        y: n.y,
        textAnchor: n.anchor,
        fontFamily: n.strong ? Fonts.sansMedium : Fonts.sans,
        fontSize: n.size,
      } as const;
      return (
        <React.Fragment key={i}>
          {n.halo ? (
            <SvgText {...common} fill={n.halo} stroke={n.halo} strokeWidth={n.size * 0.45} strokeLinejoin="round">
              {n.text}
            </SvgText>
          ) : null}
          <SvgText {...common} fill={n.color}>
            {n.text}
          </SvgText>
        </React.Fragment>
      );
    }
  }
}
