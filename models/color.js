'use strict';

const colors = ['#FF9800', '#4CAF50', '#00BCD4', '#2196F3', '#E91E63', '#9C27B0'];
const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

module.exports = {
    getRandomColor
};
