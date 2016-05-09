'use strict';

const color = class {
    constructor() {
        this.colors = ['#FF5722', '#4CAF50', '#00BCD4', '#2196F3', '#E91E63', '#9C27B0'];
    }

    getRandomColor(){
        return this.colors[Math.floor(Math.random() * this.colors.length)];
    }
};

module.exports = color;
