import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { Colors, Fonts, Typography } from '@/constants/theme';
import { buildFigure, FigureNode, GUIDES, OVERVIEW } from '@/components/measure/figure';

interface MeasureFigureProps {
  fields: string[];
  /** Display-ready values with units ("32 cm"). */
  values: Record<string, string>;
  focused?: string | null;
  height?: number;
  /**
   * interactive: zooms to the field being typed in (the Measure step).
   * static: the whole figure with every value written on it (review, order page).
   */
  mode?: 'interactive' | 'static';
}

// Static view gets side margins in the drawing grid so long labels like
// "Sleeve Length 23 in" fit beside the figure.
const VIEW = { interactive: { x: 0, w: 300 }, static: { x: -58, w: 416 } };

export function MeasureFigure({ fields, values, focused = null, height = 290, mode = 'interactive' }: MeasureFigureProps) {
  const [width, setWidth] = useState(0);
  const scale = useRef(new Animated.Value(1)).current;
  const tx = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;
  const interactive = mode === 'interactive';
  const active = interactive && focused && GUIDES[focused] ? focused : null;
  const view = VIEW[mode];

  useEffect(() => {
    if (!width || !interactive) return;
    const f = active ? GUIDES[active].focus : OVERVIEW;
    // Where the focus point sits on screen at zoom 1 (the figure is fitted inside the frame).
    const k = Math.min(width / view.w, height / 400);
    const offX = (width - view.w * k) / 2;
    const offY = (height - 400 * k) / 2;
    const px = offX + (f.cx - view.x) * k;
    const py = offY + f.cy * k;
    const native = Platform.OS !== 'web';
    const anim = (v: Animated.Value, to: number) =>
      Animated.timing(v, { toValue: to, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: native });
    Animated.parallel([
      anim(scale, f.s),
      anim(tx, -f.s * (px - width / 2)),
      anim(ty, -f.s * (py - height / 2)),
    ]).start();
  }, [active, width, height, interactive, view, scale, tx, ty]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const nodes = buildFigure({
    fields,
    values,
    active,
    labelSize: interactive ? 7.5 : 12,
    halo: Colors.mist,
  });
  const activeValue = active ? values[active]?.trim() : '';

  const svg = (
    <Svg width={width} height={height} viewBox={`${view.x} 0 ${view.w} 400`}>
      {nodes.map((n, i) => renderNode(n, i))}
    </Svg>
  );

  return (
    <View style={[styles.frame, { height }, !interactive && styles.frameStatic]} onLayout={onLayout}>
      {width > 0 &&
        (interactive ? (
          <Animated.View
            style={{ width, height, transform: [{ translateX: tx }, { translateY: ty }, { scale }] }}
            pointerEvents="none"
          >
            {svg}
          </Animated.View>
        ) : (
          svg
        ))}

      {interactive && (
        <View style={styles.caption} pointerEvents="none">
          {active ? (
            <>
              <Text style={styles.captionName}>{active}</Text>
              <Text style={[styles.captionValue, !activeValue && styles.captionEmpty]}>
                {activeValue || 'Type the measurement'}
              </Text>
            </>
          ) : (
            <Text style={styles.captionHint}>Tap a field to see where it is measured</Text>
          )}
        </View>
      )}
    </View>
  );
}

function renderNode(n: FigureNode, i: number) {
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

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: Colors.mist,
    marginBottom: 16,
  },
  frameStatic: {
    marginBottom: 0,
  },
  caption: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  captionName: {
    ...Typography.house,
    color: Colors.ink,
  },
  captionValue: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  captionEmpty: {
    fontFamily: Fonts.sans,
    fontSize: 12.5,
    color: Colors.caption,
  },
  captionHint: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.caption,
  },
});
