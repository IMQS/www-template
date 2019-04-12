<template>
	<div class="template-map-container">
		<div id="template-map"></div>
	</div>
</template>

<style lang="less">
@import (reference) "./lib/css/00-vars-mixins.less";
@import "./css/common.less";

.template-map-container {
	height: 100%;
	display: flex;
}

#template-map {
	height: 100%;
	position: relative;
	flex-grow: 1;
	width: 100%;
}
</style>
