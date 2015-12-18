var TabeebAnnotationManager = null;

(function () {
	'use strict';

	/**
	 * Used to organize plugin annotations into one manageable array.
	 * Checks for duplicates when adding annotations and updates instead of adding two of the same entry
	 * @constructor
	 */
	TabeebAnnotationManager = function TabeebAnnotationManager () {
		var self = this;
		var $self = $(this);
		/**@type {Array.<TabeebAnnotation>}*/
		var annotations = [];
		/**@type {Array.<TabeebAnnotation>}*/
		var selectedAnnotations = [];

		/**
		 * Adds the annotation to the array, or updates if exists
		 * @param {TabeebAnnotation} annotation
		 * @param {Boolean} [doNotSort]
		 * @returns {TabeebAnnotation}
		 */
		self.add = function (annotation, doNotSort) {
			var existingAnnotation = findAnnotation(annotation);
			if (existingAnnotation)
			{
				$.extend(existingAnnotation, annotation);
				$self.trigger(createAnnotationManagerEvent(TabeebAnnotationManager.Events.annotationUpdated, annotation));
				if (doNotSort !== true)
					sortByDate();

				return existingAnnotation;
			}
			else
			{
				if (annotation.constructor == Object)
					annotation = convertToTabeebAnnotation(annotation);
				clearSelection();
				annotations.push(annotation);

				annotation.children = self.getChildAnnotations(annotation);

				if (annotation.parentId && annotation.parentId.length > 0) {
					var parentAnnotation = findAnnotation(annotation.parentId);

					if (parentAnnotation)
					{
						parentAnnotation.children.push(annotation);
						annotation.parent = parentAnnotation;
					}
				}

				$self.trigger(createAnnotationManagerEvent(TabeebAnnotationManager.Events.annotationAdded, annotation));

				if (doNotSort !== true)
					sortByDate();

				return annotation;
			}
		};

		/**
		 * @param {TabeebAnnotation|String} annotationOrAnnotationId
		 * @param {Boolean} isLocked
		 */
		self.setAnnotationLocked = function (annotationOrAnnotationId, isLocked) {
			var ann = findAnnotation(annotationOrAnnotationId);
			ann.locked = isLocked;
			$self.trigger($.Event(TabeebAnnotationManager.Events.annotationLockedChanged, { annotation: ann, isLocked: isLocked}));
		};

		/**
		 * @param {TabeebAnnotation|String} annotationOrAnnotationId
		 * @param {Boolean} isHidden
		 * @param {Boolean} [applyToChildren]
		 */
		self.setAnnotationHidden = function (annotationOrAnnotationId, isHidden, applyToChildren) {
			var ann = findAnnotation(annotationOrAnnotationId);

            if (ann == null)
                return;

			if (ann.hidden === true && isHidden === false && ann.parentId && ann.parentId.length > 0) {
				var parentAnn = findAnnotation(ann.parentId);
				self.setAnnotationHidden(parentAnn, isHidden, false);
			}

			if (isHidden === true && ann.selected === true) {
				self.unselectAnnotation(ann);
			}

			ann.hidden = isHidden;
			$self.trigger($.Event(TabeebAnnotationManager.Events.annotationHiddenChanged, { annotation: ann, isHidden: isHidden}));



			if (applyToChildren !== false)
			{
				var childAnnotations = self.getChildAnnotations(ann);
				childAnnotations.forEach(function (ann) { self.setAnnotationHidden(ann, isHidden, false); });
			}
		};

		/**
		 * @returns {Number}
		 */
		self.count = function () {
			return annotations.length;
		};

		/**
		 * @returns {Array.<TabeebAnnotation>}
		 */
		self.getAll = function () {
			return annotations;
		};

		/**
		 * @param {Array} annotations
		 */
		self.addAll = function (annotations) {
			for (var i = 0; i < annotations.length; i++)
			{
				self.add(annotations[i], true);
			}
			sortByDate();
		};

		/**
		 * @returns {Array.<TabeebAnnotation>}
		 */
		self.getSelectedAnnotations = function () {
			return selectedAnnotations;
		};

		/**
		 * @param {TabeebAnnotation | String} annotationOrAnnotationId
		 * @param {Boolean} [clearSelectedAnnotations]
		 * @param {Boolean} [selectParent]
		 */
		self.selectAnnotation = function (annotationOrAnnotationId, clearSelectedAnnotations, selectParent) {
			var annotation = findAnnotation(annotationOrAnnotationId);

			if (annotation.canBeSelected() === false) return;

			if (clearSelectedAnnotations === true) {
				self.getSelectedAnnotations().forEach(function (a) {
					self.unselectAnnotation(a);
				});
			}

			if (annotation.selected !== true)
			{
				annotation.selected = true;
				selectedAnnotations.push(annotation);
				$self.trigger(createAnnotationManagerEvent(TabeebAnnotationManager.Events.annotationSelected, annotation));

				if (selectParent === true && annotation.parentId && annotation.parentId.length > 0) {
					self.selectAnnotation(annotation.parentId, false, false);
				}

				if (annotation.type != TabeebAnnotationType.Hotspot) {
					var childAnnotations = self.getChildAnnotations(annotation);
					childAnnotations.forEach(function (a) { self.selectAnnotation(a); });
				}
			}
		};

		self.clearSelectedAnnotations = function () {
			var count = selectedAnnotations.length;
			for (var i = 0; i < count; i ++) {
				var a = selectedAnnotations[0];
				self.unselectAnnotation(a);
			}
		};

		self.unselectAnnotation = function (annotationOrAnnotationId) {
			var annotation = findAnnotation(annotationOrAnnotationId);
			annotation.selected = false;

			var index = selectedAnnotations.indexOf(annotation);
			if (index >= 0)
			{
				selectedAnnotations.splice(index, 1);
				$self.trigger(createAnnotationManagerEvent(TabeebAnnotationManager.Events.annotationUnselected, annotation));
			}
			else
			{
				console.warn("Annotation is not selected", annotation);
			}
		};

		/**
		 * @param {TabeebAnnotation | String} annotationOrAnnotationId
		 */
		self.remove = function (annotationOrAnnotationId) {
			var annotationToRemove = findAnnotation(annotationOrAnnotationId);
			var index = annotations.indexOf(annotationToRemove);
			if (index >= 0)
			{
				if (annotationToRemove.selected === true)
					self.unselectAnnotation(annotationToRemove);

				var childrenAnnotations = self.getChildAnnotations(annotationOrAnnotationId);
				annotations.splice(index, 1);
				childrenAnnotations.forEach(function (ann) {
					self.remove(ann);
				});

				if (annotationToRemove.parent && annotationToRemove.parent.children) {
					var idx = annotationToRemove.parent.children.indexOf(annotationToRemove);
					if (idx >= 0)
					{
						annotationToRemove.parent.children.splice(idx, 1);
					}
				}

				$self.trigger(createAnnotationManagerEvent(TabeebAnnotationManager.Events.annotationRemoved, annotationToRemove));
			}
		};

		/**
		 * @param {TabeebAnnotation | String} annotationOrAnnotationId
		 * @returns {TabeebAnnotation}
		 */
		self.find = function (annotationOrAnnotationId) { return findAnnotation(annotationOrAnnotationId); };

		/**
		 * @param {TabeebAnnotationType} annotationType
		 * @returns {TabeebAnnotation}
		 */
		self.getAnnotationsByType = function (annotationType) {
			return $.grep(annotations, function (a) {
				return a.type == annotationType && a.parentId == null;
			});
		};

		/**
		 * @param {TabeebAnnotation | String} parentAnnotationOrAnnotationId
		 * @returns {TabeebAnnotation[]}
		 */
		self.getChildAnnotations = function (parentAnnotationOrAnnotationId) {
			var parentAnnotation = findAnnotation(parentAnnotationOrAnnotationId);
			if (parentAnnotation)
			{
				return $.grep(annotations, function (a) {
					return a.parentId == parentAnnotation.id;
				});
			}
			return [];
		};

		self.clear = function () {
			annotations.splice(0, annotations.length);
			$self.trigger($.Event(TabeebAnnotationManager.Events.annotationsCleared));
		};

		/**
		 * @param timestampBegin - Time
		 * @param interval - Length of time
		 * @param {String} parentId
		 * @returns {Array}
		 */
		self.getAnnotationsByTime = function (timestampBegin, interval, parentId) {
			return $.grep(annotations, function (a) {
				if (a == null) return false;
				if (a.hidden === true) return false;
				//if (!parentId && a.parentId != null) return false;
				if (parentId && a.parentId != parentId) return false;
				if (a.type == TabeebAnnotationType.Audio) return false;
				return a.timestamp == -1 || (timestampBegin >= a.timestamp && timestampBegin - interval <= a.timestamp);
			});
		};

		self.setDimmedExcept = function (annotation) {
			for (var i = 0; i < annotations.length; i++)
			{
				annotations[i].dimmed = annotation && (annotations[i].id !== annotation.id || annotations[i].parentId !== annotation.id);
			}
		};

		function sortByDate () {
			annotations.sort(function (a, b) {
				return a.dateCreated - b.dateCreated;
			});
		}

		/**
		 * @param annotation
		 * @returns {TabeebAnnotation}
		 */
		function convertToTabeebAnnotation (annotation) {
			switch (annotation.type)
			{
				case TabeebAnnotationType.Stroke:
					return new StrokeAnnotation(annotation);
				case TabeebAnnotationType.ErasedStroke:
					return new StrokeAnnotation(annotation);
				case TabeebAnnotationType.LaserStroke:
					return new StrokeAnnotation(annotation);
				case TabeebAnnotationType.Text:
					return new TextAnnotation(annotation);
				case TabeebAnnotationType.Audio:
					return annotation;
				case TabeebAnnotationType.Callout:
					return new CalloutAnnotation(annotation);
				case TabeebAnnotationType.Line:
					return new LineAnnotation(annotation);
				case TabeebAnnotationType.Rectangle:
					return new RectangleAnnotation(annotation, false);
				case TabeebAnnotationType.Rectangle_Filled:
					return new RectangleAnnotation(annotation, true);
				case TabeebAnnotationType.Ellipse:
					return new CircleAnnotation(annotation, false);
				case TabeebAnnotationType.Ellipse_Filled:
					return new CircleAnnotation(annotation, true);
				case TabeebAnnotationType.ArrowEnd:
					return new ArrowLineAnnotation(annotation, false);
				case TabeebAnnotationType.ArrowBoth:
					return new ArrowLineAnnotation(annotation, true);
				case TabeebAnnotationType.Hotspot:
					return new HotspotAnnotation(annotation);
				default:
					console.error("Unknown annotation type", annotation.type);
			}
		}

		/**
		 * @param {TabeebAnnotation | String} annotationOrAnnotationId
		 * @returns {TabeebAnnotation}
		 */
		function findAnnotation (annotationOrAnnotationId) {
			var annotationId = typeof annotationOrAnnotationId != 'string' ? annotationOrAnnotationId.id : annotationOrAnnotationId;
			for (var i = 0; i < annotations.length; i++)
			{
				if (annotations[i].id == annotationId)
					return annotations[i];
			}
			return null;
		}

		function clearSelection () {
			for (var i = 0; i < annotations.length; i++)
			{
				annotations[i].selected = false;
			}
		}

		function createAnnotationManagerEvent (type, annotation) {
			return $.Event(type, {
				annotation: annotation
			});
		}
	};

	TabeebAnnotationManager.Events = {
		annotationAdded: "annMgrAnnotationAdded",
		annotationUpdated: "annMgrAnnotationUpdated",
		annotationRemoved: "annMgrAnnotationRemoved",
		annotationsCleared: "annMgrAnnotationsCleared",
		annotationLockedChanged: "annMgrAnnotationLockedChanged",
		annotationHiddenChanged: "annMgrAnnotationHiddenChanged",
		annotationSelected: "annMgrAnnotationSelected",
		annotationUnselected: "annMgrAnnotationUnselected"
	};
})();
