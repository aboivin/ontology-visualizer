import React, { useEffect, useRef, useState } from 'react'
import './App.css'
import { select } from 'd3-selection'
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force';
import { drag } from 'd3-drag';
import { scaleSequential } from 'd3-scale';
import { zoom } from "d3-zoom";
import { CircularProgress } from "@material-ui/core";
import { interpolateViridis } from "d3-scale-chromatic";

const GraphRepresentation = (props) => {

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (props.ontology != null && props.entityClassId != null) {
            setLoading(true);
            createGraph();
        }
    }, [props]);
    const svg = useRef();

    const color = d => {
        const color = scaleSequential().domain([-3, 3]).interpolator(interpolateViridis);
        return color(d.height);
    }

    const computeRadius = node => {
        return Math.max(30 + node.height * 7, 5);
    }

    const createGraph = () => {
        const [nodes, links] = props.ontology.entityHierarchy(props.entityClassId);

        const simulation = forceSimulation(nodes)
            .force('link', forceLink(links).id(l => l.id).distance(l => 100 - l.height * 25 + 0.05))
            .force('charge', forceManyBody())
            .force('collision', forceCollide().radius(n => computeRadius(n) * 4))
            .force('center', forceCenter(props.width / 2, props.height / 2));

        setTimeout(() => setLoading(false), 2000);

        select(svg.current).attr('viewBox', `0 0 ${props.width} ${props.height}`);

        select('.zoom-container').remove();

        const zoomContainer = select(svg.current)
            .append('g')
            .attr('class', 'zoom-container');

        select(svg.current)
            .call(zoom().on('zoom', e => {
                const { x, y, k } = e.transform;
                zoomContainer.attr('transform', `translate(${x}, ${y}) scale(${k})`);
            }));

        const link = zoomContainer
            .append('g')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6)
            .selectAll('line')
            .data(links)
            .join('line')
            .attr('stroke-width', l => Math.max(l.height * 2, 2));

        const graphNode = zoomContainer
            .append('g')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1.5)
            .selectAll('.node')
            .data(nodes)
            .join('g')
            .attr('class', 'node')

        const circles = graphNode.append('circle')
                                 .attr('r', computeRadius)
                                 .attr('fill', color)
                                 .attr('stroke', '#B22222')
                                 .attr('stroke-width', d => d.id === props.entityClassId ? 4 : 0)
                                 .call(dragNode(simulation));

        const labels = graphNode.append('text')
                                .attr('dy', -20)
                                .attr('dx', -50)
                                .attr('style', 'stroke: black; font-size: 12px; stroke-width: 0.5px')
                                .text(d => d.label)

        circles.append('title')
               .text(d => d.id);

        simulation.on('tick', () => {
            link.attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            circles.attr('cx', d => d.x)
                   .attr('cy', d => d.y);
            labels.attr('x', d => d.x)
                  .attr('y', d => d.y);

        });
    }

    const dragNode = (simulation) => {
        const dragStarted = (e) => {
            if (!e.active) {
                simulation.alphaTarget(0.3).restart();
            }
            e.subject.fx = e.subject.x;
            e.subject.fy = e.subject.y;
        }

        const dragged = (e) => {
            e.subject.fx = e.x;
            e.subject.fy = e.y;
        }

        const dragEnded = (e) => {
            if (!e.active) simulation.alphaTarget(0);
            e.subject.fx = null;
            e.subject.fy = null;
        }

        return drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded);
    }
    return <div>
        <div hidden={loading}>
            <svg ref={svg} width={props.width} height={props.height}/>
        </div>
        <div hidden={!loading} className="loading">
            <CircularProgress color="secondary"/>
        </div>
    </div>
}

export default GraphRepresentation
