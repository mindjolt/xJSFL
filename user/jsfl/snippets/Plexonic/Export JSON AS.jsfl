﻿﻿/*
 * Copyright Teoken LLC. (c) 2013. All rights reserved.
 * Copying or usage of any piece of this source code without written notice from Teoken LLC is a major crime.
 * Այս կոդը Թեոկեն ՍՊԸ ընկերության սեփականությունն է:
 * Առանց գրավոր թույլտվության այս կոդի պատճենահանումը կամ օգտագործումը քրեական հանցագործություն է:
 */

/*
 * User: gsar
 * Date: 10/14/12
 * Time: 2:50 PM
 */


JsonStructurizer = function () {
};

ELEMENT_TYPE_BITMAP = "element_bitmap";
ELEMENT_TYPE_SYMBOL = "element_symbol";
ELEMENT_TYPE_TEXTFIELD = "element_textfield";
ELEMENT_TYPE_SHAPE = "element_shape";
ELEMENT_TYPE_UNDEFINED = "undefined";

var $p = JsonStructurizer.prototype;
$p.dummyFolder = "";
$p.depth = 0;
$p.rootFolder = "_structures/";
$p.structureJson = "";


$p.structurize = function (selectedItems) {
    var documentMetadata = {};
    for each (var item in selectedItems) {
        var itemMetadata = {};
        documentMetadata[item.itemName] = itemMetadata;
        itemMetadata.libraryName = item.name;
        itemMetadata.layers = [];
        $p.crateMovieClipMetadata(item, itemMetadata.layers);
    }
    $p.structureJson = JSON.formatJson(JSON.encode(documentMetadata));
};


$p.saveStructure = function () {


    var file = new File( URI.toPath(fl.browseForFileURL(
        "save", //
        "Choose json file location", //
        "JSON File (*.json)", //
        "json" //
    )));
    file.write($p.structureJson);
    file.save();
};

$p.crateMovieClipMetadata = function (item, metadata) {
    var q = 1;
    for (var i = 0; i < item.timeline.layers.length; i++) {
        var layer = item.timeline.layers[i];
        if ( layer.layerType == "folder") {
            continue;
        }
        var layerObject = {};
        var layerMeta = {};
        if (item.timeline.findLayerIndex(layer.name).length == 1)
            layerMeta.name = layer.name;
        else {
            layerMeta.name = layer.name + "_" + q;
            q++;
        }
        if (layer.parentLayer != null) {
            layerMeta.folder = layer.parentLayer.name;
        }
        else
            layerMeta.folder = "";
        layerMeta.layerType = layer.layerType;
        layerObject.layerMeta = layerMeta;
        layerObject.children = [];
        for (var j = 0; j < layer.frames.length; j++) {
            var frame = layer.frames[j];
            if (j == frame.startFrame) {
                var elements = frame.elements;
                for (var k = 0; k < elements.length; k++) {
                    var element = elements[k];
                    // do something with element
                    $p.crateElementMetadata(element, layerObject.children);
                }
            }
        }
        metadata.push(layerObject);
    }

    return metadata;
};

$p.crateElementMetadata = function (element, metadata) {
    var elementMetadata = $p.crateElementGenericMetadata(element);
    var elementName = "";
    var elementLibraryName = "";
    var elementKind = "";
    var customMetadataSetter = null;
    switch (getElementType(element)) {
        case ELEMENT_TYPE_BITMAP:
            elementName = (new File(element.libraryItem.name)).name;
            elementKind = "image";
            break;
        case ELEMENT_TYPE_SYMBOL:
            elementName = element.name;
            elementKind = "sprite";
            elementLibraryName = element.libraryItem.name;
            customMetadataSetter = $p.symbolCustomMetadataSetter;
            break;
        case ELEMENT_TYPE_TEXTFIELD:
            elementName = element.name;
            elementKind = "text";
            customMetadataSetter = $p.textFieldCustomMetadataSetter;
            break;
        case ELEMENT_TYPE_SHAPE:
            elementName = element.name;
            elementKind = "quad";
            customMetadataSetter = $p.shapeCustomMetadataSetter;
            break;
        default:
            //inspect(element);
            break;
    }

    $p.setElementSpecificMetadata(elementName, elementLibraryName, elementKind, element, elementMetadata, customMetadataSetter);
    metadata.push(elementMetadata);
};

$p.setElementSpecificMetadata = function (name, libraryName, kind, element, elementMetadata, customMetadataSetter) {
    $p.setElementNameAndKind(name, libraryName, kind, elementMetadata);
    if (customMetadataSetter) {
        customMetadataSetter(element, elementMetadata);
    }
};

$p.shapeCustomMetadataSetter = function (element, elementMetadata) {
    elementMetadata.color = $p.formatColor(element.contours[1].fill.color);
    elementMetadata.x = element.left;
    elementMetadata.y = element.top;
    $p.setElementWidthAndHeightMetadata(element, elementMetadata);
};

$p.formatColor = function (colorString) {
    return "0x" + colorString.substr(1, colorString.length - 1);
};

$p.setElementWidthAndHeightMetadata = function (element, elementMetadata) {
    elementMetadata.width = element.width;
    elementMetadata.height = element.height;
};

$p.symbolCustomMetadataSetter = function (element, elementMetadata) {
    elementMetadata.alpha = element.colorAlphaPercent * .01;
    elementMetadata.layers = $p.crateMovieClipMetadata(element.libraryItem, []);
};

$p.setElementNameAndKind = function (name, libraryName, kind, elementMetadata) {
    elementMetadata.name = name;
    elementMetadata.libraryName = libraryName;
    elementMetadata.kind = kind;
};

$p.textFieldCustomMetadataSetter = function (element, elementMetadata) {
    var textRun = element.textRuns[0];
    var textAttrs = textRun.textAttrs;
    $p.setElementWidthAndHeightMetadata(element, elementMetadata);
    elementMetadata.characters = textRun.characters;
    $p.setTextFieldAttrsMetadata(textAttrs, elementMetadata);
    $p.setTextFieldFiltersMetadata(element.filters, elementMetadata);
};


$p.setTextFieldFiltersMetadata = function (filters, elementMetadata) {
    if (!filters) {
        elementMetadata.filters = [];
        return;
    }
    var filtersMetadata = [];
    for (var i = 0; i < filters.length; ++i) {
        var filter = filters[i];
        //inspect(filter);
        filtersMetadata.push({
            name: filter.name,
            angle: filter.angle,
            blurX: filter.blurX,
            blurY: filter.blurY,
            distance: filter.distance,
            color: $p.formatColor(filter.color),
            quality: $p.formatFilterQuality(filter.quality),
            strength: filter.strength * .01
        });
    }
    elementMetadata.filters = filtersMetadata;
};

$p.formatFilterQuality = function (quality) {
    switch (quality) {
        case "low":
            return 1;
            break;
        case "medium":
            return 2;
            break;
        case "high":
            return 3;
            break;
    }
    return 3;
};

$p.setTextFieldAttrsMetadata = function (textAttrs, elementMetadata) {
    elementMetadata.bold = textAttrs.bold;
    elementMetadata.italic = textAttrs.italic;
    elementMetadata.fontFamily = textAttrs.face;
    elementMetadata.color = $p.formatColor(textAttrs.fillColor);
    elementMetadata.size = textAttrs.size;
    elementMetadata.alignment = textAttrs.alignment;

};

$p.crateElementGenericMetadata = function (element) {
    var metadata = {
        x: Math.round(element.x*100)/100,
        y: Math.round(element.y*100)/100,
        scaleX: Math.round(element.scaleX*100)/100,
        scaleY: Math.round(element.scaleY*100)/100,
        skewX : Math.round(element.skewX*100)/100,
        skewY : Math.round(element.skewY*100)/100
};
    return metadata;
};

function getElementType(element) {
    switch (element.instanceType) {
        case "bitmap":
            return ELEMENT_TYPE_BITMAP;
            break;
        case "symbol":
            return ELEMENT_TYPE_SYMBOL;
            break;
        case undefined:
            if (element.toString() == "[object Text]") {
                return ELEMENT_TYPE_TEXTFIELD;
            } else if (element.elementType == "shape") {
                return ELEMENT_TYPE_SHAPE;
            }
            return ELEMENT_TYPE_UNDEFINED;
            break;
    }
    return null;
}

(function () {
    xjsfl.init(this);
    var elements = $$("ext_*").elements;
    var structurizer = new JsonStructurizer();
    structurizer.structurize(elements);
    structurizer.saveStructure();
    alert("Done!");

})();