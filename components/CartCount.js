import React from 'react';
import PropTypes from 'prop-types';
import {TransitionGroup, CSSTransition} from 'react-transition-group';
import styled from 'styled-components';

const AnimationStyles = styled.span`
    position: relative;
    .count {
        display: block;
        position: relative;
        transition: all 0.6s;
        backface-visibilty: hidden;
    }
    /* Initial State of the entered GreenDot */
    .count-enter {
        transform: scale(2) rotateX(0.5turn);
    }
    .count-enter-active {
        transform: rotateX(0)
    }
    .count-exit {
        top: 0;
        position: absolute;
        transform: rotateX(0)
    }
    .count-exit-active {
        transform: scale(2) rotateX(0.5turn);
    }
`;

const GreenDot = styled.div`
    background: green;
    color: #fff;
    border-radius: 50%;
    padding: 0.5rem;
    line-height: 2rem;
    min-width: 3rem;
    margin-left: 1rem;
    font-weight: 100;
    font-feature-settings: 'tnum';
    font-variant-numeric: tabular-nums;
`;

const CartCount = ({count}) => (
    <AnimationStyles>
    <TransitionGroup>
        <CSSTransition unmountOnExit className="count" classNames="count" key={count} timeout={{enter: 600, exit: 600}}>
            <GreenDot>
                {count}
            </GreenDot>
        </CSSTransition>
    </TransitionGroup>
    </AnimationStyles>
);

export default CartCount;
