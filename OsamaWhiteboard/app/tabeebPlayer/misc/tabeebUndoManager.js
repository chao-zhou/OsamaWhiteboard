/**
 * Created by cody on 7/7/15.
 */

/**
 * @param {jQuery} $triggerElement
 * @param {TabeebCanvasService} canvasService
 * @param {TabeebAnnotationManager} annotationMgr
 * @param {jQuery} $undoButton
 * @param {jQuery} $redoButton
 * @class
 */
function TabeebUndoManager($triggerElement, canvasService, annotationMgr, $undoButton, $redoButton) {

    var operations = [];
    var operationIndex = -1;

    init();

    this.undo = function () {
        clickedUndoButton();
    };

    this.redo = function () {
        clickedRedoButton();
    };

    /**
     * Clears all operations.
     */
    this.clearBuffer = function () {
        operations = [];
        operationIndex = -1;
        updateButtonStates();
    };

    /** @param {number} annotationId */
    this.getLastOperationWithAnnotationId = function (annotationId) {
        for (var i = operations.length - 1; i >= 0; i--)
        {
            if(operations[i].annotation.id == annotationId)
                return operations[i];
        }
        return null;
    };

    /**
     * @returns {TabeebOperation}
     */
    this.getLastOperation = function () { console.log(operations); return operations[operationIndex]; };

    /**
     * @returns {Number}
     */
    this.getOperationCount = function () { return operations.length; };

    function init () {
        $triggerElement.on(TabeebOperationEvent.annotationAdded, onAnnotationAdded);
        $triggerElement.on(TabeebOperationEvent.annotationDeleted, onAnnotationDeleted);
        $triggerElement.on(TabeebOperationEvent.annotationUpdated, onAnnotationUpdated);
    }

    /** @param {Number} index */
    function setOperationIndex (index)
    {
        operationIndex = index;
    }

    /** @param {{oldAnnotationData:TabeebAnnotation,newAnnotationData:TabeebAnnotation}} e */
    function onAnnotationUpdated (e) {
        if (e.oldAnnotationData.type == TabeebAnnotationType.Audio && annotation.parentId == null)
            return;

        addOperation(new TabeebUpdateAnnotationOperation(e.oldAnnotationData, e.newAnnotationData));
        updateButtonStates();
    }

    /** @param {{annotation:TabeebAnnotation}} e */
    function onAnnotationAdded (e) {
        var annotation = e.annotation;
        if (annotation.type != TabeebAnnotationType.Audio && annotation.parentId == null)
            addOperation(new TabeebAddAnnotationOperation(annotation));
        updateButtonStates();
    }

    /** @param {{annotation:TabeebAnnotation}} e */
    function onAnnotationDeleted (e) {
        var annotation = e.annotation;

        if (!annotation)
            console.warn("Unable to find annotation");

        if (annotation.type != TabeebAnnotationType.Audio && annotation.parentId == null)
            addOperation(new TabeebDeleteAnnotationOperation(annotation));
        updateButtonStates();
    }

    /** @param {{annotation:TabeebAnnotation, oldLocation:Object, newLocation:Object}} e */
    function onAnnotationPositionUpdated (e) {
        var annotation = e.annotation;
        var oldLocation = e.oldLocation;
        var newLocation = e.newLocation;
        addOperation(new TabeebMoveAnnotationOperation(annotation, oldLocation, newLocation));
        updateButtonStates();
    }

    /** @param {TabeebOperation} operation */
    function addOperation (operation)
    {
        var lastOperation = operations[operationIndex];
        // Don't add operation if it is exactly the same as the previous
        if (lastOperation != null && lastOperation.equals(operation))
        {
            console.info("Not Adding Duplicate Operation");
            return;
        }

        setOperationIndex(operationIndex+1);
        operations.splice(operationIndex, operations.length);
        operations.push(operation);
        updateButtonStates();
    }

    /** @param {number} index */
    function callUndoOperation (index)
    {
        if (index == null) index = operationIndex;
        operations[index].undo($triggerElement, canvasService, annotationMgr);
        canvasService.redrawAnnotations();
    }

    /** @param {number} index */
    function callRedoOperation (index)
    {
        if (index == null) index = operationIndex;
        operations[index].redo($triggerElement, canvasService, annotationMgr);
        canvasService.redrawAnnotations();
    }

    function clickedUndoButton () {
        if ($undoButton.hasClass("disabled")) return;

        callUndoOperation();
        setOperationIndex(operationIndex-1);
        updateButtonStates();
    }

    function clickedRedoButton () {
        if ($redoButton.hasClass("disabled")) return;

        setOperationIndex(operationIndex+1);
        callRedoOperation();
        updateButtonStates();
    }

    function updateButtonStates () {
        if (operationIndex + 1 < operations.length)
            $redoButton.removeClass("disabled");
        else
            $redoButton.addClass("disabled");

        if (operationIndex >= 0)
            $undoButton.removeClass("disabled");
        else
            $undoButton.addClass("disabled");
    }

    updateButtonStates();
}

/**
 * @param {TabeebAnnotation} annotation
 * @class
 * @property {string} action
 * @property {TabeebAnnotation} annotation
 */
function TabeebOperation(annotation) {
    this.action = null;
    /**
     * @param {TabeebAnnotation} annotation
     */
    this.init = function (annotation) {
        if (annotation == null)
        {
            console.error("Null annotation was passed through.");
        }
        // Used as data, not reference
        this.annotation = $.extend(true, {}, annotation);
        this.data = {};
    };
    /**
     * @param {jQuery} $triggerElement
     * @param {TabeebCanvasService} canvasService
     * @param {TabeebAnnotationManager} annotationMgr
     */
    this.redo = function ($triggerElement, canvasService, annotationMgr) { console.error("Not implemented.", this); };
    /**
     * @param $triggerElement
     * @param {TabeebCanvasService} canvasService
     * @param {TabeebAnnotationManager} annotationMgr
     */
    this.undo = function ($triggerElement, canvasService, annotationMgr) { console.error("Not implemented", this); };
    /**
     * @param {TabeebOperation} operation
     * @returns {boolean}
     */
    this.equals = function (operation) {
        return this.action == operation.action && this.annotation.id == operation.annotation.id && JSON.stringify(this.data) === JSON.stringify(operation.data);
    };
}

/**
 * @param {TabeebAnnotation} annotation
 * @constructor
 * @extends TabeebOperation
 */
function TabeebAddAnnotationOperation(annotation) {
    this.init(annotation);
    this.action = "add";
    this.undo = function ($triggerElement, canvasService, annotationMgr) {
        annotationMgr.remove(this.annotation);
        $triggerElement.trigger(TabeebEvent.annotationDeleted, this.annotation);
    };
    this.redo = function ($triggerElement, canvasService, annotationMgr) {
        annotationMgr.add(this.annotation);
        $triggerElement.trigger(TabeebEvent.annotationRestored, this.annotation);
    };
}

/**
 * @param {TabeebAnnotation} annotation
 * @constructor
 * @extends TabeebOperation
 */
function TabeebDeleteAnnotationOperation(annotation) {
    this.init(annotation);
    this.action = "delete";
    this.undo = function ($triggerElement, canvasService, annotationMgr) {
        annotationMgr.add(this.annotation);
        $triggerElement.trigger(TabeebEvent.annotationRestored, this.annotation);
    };
    this.redo = function ($triggerElement, canvasService, annotationMgr) {
        annotationMgr.remove(this.annotation);
        $triggerElement.trigger(TabeebEvent.annotationDeleted, this.annotation);
    };
}

/**
 * @param {TabeebAnnotation} annotation
 * @param {object} oldLocation
 * @param {object} newLocation
 * @constructor
 * @extends TabeebOperation
 */
function TabeebMoveAnnotationOperation(annotation, oldLocation, newLocation) {
    this.init(annotation);
    this.data = {
        oldLocation: $.extend({}, oldLocation),
        newLocation: $.extend({}, newLocation)
    };
    console.log("CREATIGN");
    this.printDebugMessage = function () {
        console.log("Old Location", JSON.stringify(this.data.oldLocation));
        console.log("New Location", JSON.stringify(this.data.newLocation));
    };
    this.printDebugMessage();
    this.action = "move";
    this.undo = function ($triggerElement, canvasService, annotationMgr) {
        this.annotation.setCoordinates(this.data.oldLocation);
        var event = $.Event(TabeebEvent.annotationsUpdated, {annotations: [this.annotation]});
        $triggerElement.trigger(event);
        this.printDebugMessage();
    };
    this.redo = function ($triggerElement, canvasService, annotationMgr) {
        this.annotation.setCoordinates(this.data.newLocation);
        var event = $.Event(TabeebEvent.annotationsUpdated, {annotations: [this.annotation]});
        $triggerElement.trigger(event);
        this.printDebugMessage();
    };
}

/**
 * @param {TabeebAnnotation} annotation
 * @param {{color:string,width:number}} newAttribute
 * @param {{color:string,width:number}} oldAttribute
 * @constructor
 * @extends TabeebOperation
 */
function TabeebEditAnnotationStrokeOperation(annotation, newAttribute, oldAttribute) {
    this.init(annotation);
    this.action = "edit";
    this.annotation.setStrokeAttributes(this.data);
    this.undo = function ($triggerElement, canvasService, annotationMgr) {
        this.annotation.setStrokeAttributes(oldAttribute);
        var event = $.Event(TabeebEvent.annotationsUpdated, {annotations: [this.annotation]});
        $triggerElement.trigger(event);
    };
    this.redo = function ($triggerElement, canvasService, annotationMgr) {
        this.annotation.setStrokeAttributes(newAttribute);
        var event = $.Event(TabeebEvent.annotationsUpdated, {annotations: [this.annotation]});
        $triggerElement.trigger(event);
    };
}

/**
 * @param {TabeebAnnotation} annotation
 * @param {string} oldText
 * @param {string} newText
 * @constructor
 * @extends TabeebOperation
 */
function TabeebEditTextAnnotation(annotation, oldText, newText) {
    this.init(annotation);
    this.action = "textedit";
    this.undo = function ($triggerElement, canvasService, annotationMgr) {
        this.annotation.textInfo.text = oldText;
        annotationMgr.find(this.annotation).textInfo.text = oldText;
        console.info("Changing text to: " + oldText);
        triggerEvent($triggerElement, annotation);
    };
    this.redo = function ($triggerElement, canvasService, annotationMgr) {
        this.annotation.textInfo.text = newText;
        annotationMgr.find(this.annotation).textInfo.text = newText;
        console.info("Changing text to: " + newText);
        triggerEvent($triggerElement, annotation);
    };
}

/**
 * @param {TabeebAnnotation} oldAnnotationData
 * @param {TabeebAnnotation} newAnnotationData
 * @constructor
 * @extends TabeebOperation
 */
function TabeebUpdateAnnotationOperation (oldAnnotationData, newAnnotationData) {
    this.annotation = {};
    this.action = "update";

    this.undo = function ($triggerElement, canvasService, annotationMgr) {
        var annotation = annotationMgr.find(oldAnnotationData.id);
        $.extend(annotation, oldAnnotationData);
        triggerEvent($triggerElement, oldAnnotationData);
    };
    this.redo = function ($triggerElement, canvasService, annotationMgr) {
        var annotation = annotationMgr.find(oldAnnotationData.id);
        $.extend(annotation, newAnnotationData);
        triggerEvent($triggerElement, newAnnotationData);
    };
    /**
     * @param {jQuery} $triggerElement
     * @param {TabeebAnnotation} annotation
     */
    function triggerEvent ($triggerElement, annotation)
    {
        var event = $.Event(TabeebEvent.annotationsUpdated, {annotations: [annotation]});
        $triggerElement.trigger(event);
    }
    this.equals = function (operation) {
        return false;
    }
}

TabeebAddAnnotationOperation.inheritsFrom(TabeebOperation);
TabeebDeleteAnnotationOperation.inheritsFrom(TabeebOperation);
TabeebMoveAnnotationOperation.inheritsFrom(TabeebOperation);
TabeebEditTextAnnotation.inheritsFrom(TabeebOperation);
TabeebEditAnnotationStrokeOperation.inheritsFrom(TabeebOperation);
TabeebUpdateAnnotationOperation.inheritsFrom(TabeebOperation);

/**
 * @readonly
 * @enum {string}
 */
var TabeebOperationEvent = {
    annotationAdded: "annotationAddedUM",
    annotationDeleted: "annotationDeletedUM",
    annotationMoved: "annotationMovedUM",
    annotationEdited: "annotationEditedUM",
    annotationUpdated: "annotationUpdatedUM"
};
