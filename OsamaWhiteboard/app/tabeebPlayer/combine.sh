#!/bin/bash
rm tabeebPlayer.combined.js

cat \
	tabeebPlayerEnums.js \
	tabeebPlayerInput.js \
	tabeebPlayerUtil.js \
	tabeebPlayerVideo.js \
	tabeebPlayerPresenter.js \
	tabeebPlayerAudio.js \
	tabeebPlayerPresenter.js \
	canvas/annotations/Annotations.js \
	canvas/annotations/ShapeAnnotation.js \
	canvas/annotations/StrokeAnnotation.js \
	canvas/annotations/TextAnnotation.js \
	canvas/annotations/LineAnnotation.js \
	canvas/annotations/ArrowLineAnnotation.js \
	canvas/annotations/CalloutAnnotation.js \
	canvas/annotations/HotspotAnnotation.js \
	canvas/annotations/CircleAnnotation.js \
	canvas/annotations/RectangleAnnotation.js \
	canvas/*.js \
	gallery/*.js \
	hud/*.js \
	misc/*.js \
	pdf/*.js \
	sidebar/*.js \
	sidebar/**/*.js \
	users/*.js \
	util/*.js \
	tabeebPlayer.js \
	tabeebPlayerAPI.js \
	tabeebPlayerMinifiedSettings.js \
		>> tabeebPlayer.combined.js

java -jar ../../yuicompressor-2.4.8.jar tabeebPlayer.combined.js -o tabeebPlayer.min.js --nomunge

#sleep 10
#echo "Removing combined js file"
#rm combined.tmp.js
