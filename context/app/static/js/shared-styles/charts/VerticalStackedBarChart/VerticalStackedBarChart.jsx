import React from 'react';
import { BarStack } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { withParentSize } from '@visx/responsive';
import { GridRows } from '@visx/grid';
import Typography from '@material-ui/core/Typography';

import { useChartTooltip } from 'js/shared-styles/charts/hooks';
import { getChartDimensions } from 'js/shared-styles/charts/utils';
import StackedBar from 'js/shared-styles/charts/StackedBar';

function VerticalStackedBarChart({
  parentWidth,
  parentHeight,
  visxData,
  yScale,
  xScale,
  colorScale,
  getX,
  keys,
  margin,
  xAxisLabel,
  yAxisLabel,
  TooltipContent,
}) {
  const { xWidth, yHeight } = getChartDimensions(parentWidth, parentHeight, margin);

  yScale.rangeRound([yHeight, 0]);
  xScale.rangeRound([0, xWidth]);

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    containerRef,
    TooltipInPortal,
    handleMouseEnter,
    handleMouseLeave,
  } = useChartTooltip();

  return (
    <>
      <svg width={parentWidth} height={parentHeight} ref={containerRef}>
        <GridRows top={margin.top} left={margin.left} scale={yScale} width={xWidth} stroke="black" opacity={0.2} />
        <Group top={margin.top} left={margin.left}>
          <BarStack
            data={visxData}
            keys={keys}
            height={yHeight}
            x={getX}
            xScale={xScale}
            yScale={yScale}
            color={colorScale}
          >
            {(barStacks) => {
              return barStacks.map((barStack) =>
                barStack.bars.map(
                  (bar) =>
                    bar.width > 0 && (
                      <StackedBar
                        direction="vertical"
                        bar={bar}
                        hoverProps={{
                          onMouseEnter: handleMouseEnter(bar, barStack.index),
                          onMouseLeave: handleMouseLeave,
                        }}
                      />
                    ),
                ),
              );
            }}
          </BarStack>
          <AxisLeft
            hideTicks
            scale={yScale}
            label={yAxisLabel}
            stroke="black"
            tickLabelProps={() => ({
              fill: 'black',
              fontSize: 11,
              textAnchor: 'end',
              dy: '0.33em',
            })}
            labelProps={{
              fontSize: 12,
            }}
          />
          <AxisBottom
            hideTicks
            top={yHeight}
            scale={xScale}
            label={xAxisLabel}
            stroke="black"
            tickStroke="black"
            numTicks={Object.keys(visxData).length}
            tickLabelProps={() => ({
              fill: 'black',
              fontSize: 11,
              textAnchor: 'middle',
            })}
            labelProps={{
              fontSize: 12,
              textAnchor: 'middle',
            }}
          />
        </Group>
      </svg>
      {tooltipOpen && (
        <TooltipInPortal top={tooltipTop} left={tooltipLeft}>
          {TooltipContent ? (
            <TooltipContent tooltipData={tooltipData} />
          ) : (
            <>
              <Typography>{tooltipData.key}</Typography>
              <Typography variant="h3" component="p" color="textPrimary">
                {tooltipData.bar.data[tooltipData.key]}
              </Typography>
            </>
          )}
        </TooltipInPortal>
      )}
    </>
  );
}

export default withParentSize(VerticalStackedBarChart);
