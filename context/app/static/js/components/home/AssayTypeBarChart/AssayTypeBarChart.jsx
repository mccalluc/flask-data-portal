import React from 'react';
import { BarStackHorizontal } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisTop, AxisLeft } from '@visx/axis';
import { withParentSize } from '@visx/responsive';
import { GridColumns } from '@visx/grid';
import Typography from '@material-ui/core/Typography';

import { useChartTooltip } from 'js/shared-styles/charts/hooks';

function AssayTypeBarChart({
  parentWidth,
  parentHeight,
  visxData,
  docCountScale,
  dataTypeScale,
  colorScale,
  keys,
  margin,
  selectedColorFacetName,
}) {
  const xHeight = parentWidth - margin.left - margin.right;
  const yHeight = parentHeight - margin.top - margin.bottom;

  docCountScale.rangeRound([0, xHeight]);
  dataTypeScale.rangeRound([yHeight, 0]);

  const {
    hoveredBarIndices,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    containerRef,
    TooltipInPortal,
    handleMouseEnter,
    handleMouseLeave,
  } = useChartTooltip();

  const strokeWidth = 1.5;

  return (
    <div>
      <svg width={parentWidth} height={parentHeight} ref={containerRef}>
        <GridColumns
          top={margin.top + 1}
          left={margin.left}
          scale={docCountScale}
          height={yHeight}
          stroke="black"
          opacity={0.38}
        />
        <Group top={margin.top} left={margin.left}>
          <BarStackHorizontal
            data={visxData}
            keys={keys}
            height={yHeight}
            y={(d) => d.mapped_data_type}
            xScale={docCountScale}
            yScale={dataTypeScale}
            color={colorScale}
          >
            {(barStacks) => {
              return barStacks.map((barStack) =>
                barStack.bars.map(
                  (bar) =>
                    bar.width > 0 && (
                      <a
                        href={`/search?entity_type[0]=Dataset&mapped_data_types[0]=${encodeURIComponent(
                          bar.bar.data.mapped_data_type,
                        )}&${selectedColorFacetName}[0]=${encodeURIComponent(bar.key)}`}
                        key={`barstack-horizontal-${barStack.index}-${bar.index}`}
                        target="_parent"
                      >
                        {/* Make target explicit because html base target doesn't apply inside SVG. */}
                        <rect
                          x={bar.x}
                          y={bar.y}
                          width={bar.width - strokeWidth}
                          height={bar.height}
                          fill={bar.color}
                          stroke={
                            hoveredBarIndices &&
                            bar.index === hoveredBarIndices.barIndex &&
                            barStack.index === hoveredBarIndices.barStackIndex
                              ? 'black'
                              : bar.color
                          }
                          strokeWidth={strokeWidth}
                          onMouseEnter={(event) => handleMouseEnter(event, bar, barStack.index)}
                          onMouseLeave={handleMouseLeave}
                        />
                      </a>
                    ),
                ),
              );
            }}
          </BarStackHorizontal>
          <AxisLeft
            hideTicks
            scale={dataTypeScale}
            stroke="black"
            numTicks={Object.keys(visxData).length}
            tickLabelProps={() => ({
              fill: 'black',
              fontSize: 11,
              textAnchor: 'end',
              dy: '0.33em',
            })}
          />
          <AxisTop
            hideTicks
            top={1}
            scale={docCountScale}
            stroke="black"
            tickStroke="black"
            tickLabelProps={() => ({
              fill: 'black',
              fontSize: 11,
              textAnchor: 'middle',
            })}
          />
        </Group>
      </svg>
      {tooltipOpen && (
        <TooltipInPortal top={tooltipTop} left={tooltipLeft}>
          <Typography variant="subtitle2" color="secondary">
            {tooltipData.bar.data.mapped_data_type}
          </Typography>
          <Typography>{tooltipData.key}</Typography>
          <Typography variant="h3" component="p" color="textPrimary">
            {tooltipData.bar.data[tooltipData.key]}
          </Typography>
        </TooltipInPortal>
      )}
    </div>
  );
}

export default withParentSize(AssayTypeBarChart);
