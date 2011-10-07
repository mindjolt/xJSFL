﻿// ------------------------------------------------------------------------------------------------------------------------
//
//     ██ ██████ ██████ ██
//     ██ ██     ██     ██
//     ██ ██     ██     ██
//     ██ ██████ █████  ██
//     ██     ██ ██     ██
//     ██     ██ ██     ██
//  █████ ██████ ██     ██████
//
// ------------------------------------------------------------------------------------------------------------------------
// JSFL - Serialises values to XML for type-safe communication with Flash panels

	JSFLInterface =
	{
		/**
		 * Serializes values to XML so they can be passed to Flash and be deserialized to values again
		 *
		 * @param	value	{Value}		Any value
		 * @returns			{String}	An XML String
		 */
		serialize:function(value)
		{
			// utilities

				function escapeXML(xml)
				{
					return xml
						.replace(/&/g, "&amp;")
						.replace(/</g, "&lt;")
						.replace(/>/g, "&gt;")
						.replace(/"/g, "&quot;")
						.replace(/\'/g, "&apos;");
				}

				function  objectToXML(obj)
				{
					var str = '<object>';
					for (var prop in obj)
					{
						str += '<property id="' + prop + '">' + toXML(obj[prop]) + '</property>';
					}
					return str + '</object>';
				}

				function arrayToXML(arr)
				{
					var str = '<array>';
					for (var i = 0; i < arr.length; i++)
					{
						str += '<property id="' + i + '">' + toXML(arr[i]) + '</property>';
					}
					return str + '</array>';
				}

				function toXML(value)
				{
					var type = typeof value;
					if (type == 'string')
					{
						return '<string>' + escapeXML(value) + '</string>';
					}
					else if (type == 'undefined')
					{
						return '<undefined />';
					}
					else if (type == 'number')
					{
						return '<number>' + value + '</number>';
					}
					else if (value == null)
					{
						return '<null />';
					}
					else if (type == 'boolean')
					{
						return value ? '<true />' : '<false />';
					}
					else if (value instanceof Date)
					{
						return '<date>' + value.getTime() + '</date>';
					}
					else if (value instanceof Array)
					{
						return arrayToXML(value);
					}
					else if (type == 'object')
					{
						return objectToXML(value);
					}
					if (type == 'xml')
					{
						return '<xml>' + escapeXML(value.toXMLString()) + '</xml>';
					}
					else
					{
						return '<null />';
					}
				}

			// code
				return toXML(value);

		},

		getUIState:function()
		{
			var timeline = null;
			var document = fl.getDocumentDOM();
			if(document)
			{
				timeline		= document.getTimeline().name;
				document		= document.pathURI || document.name;
				//var selLayers	= timeline.getSelectedLayers();
				//var selFrames	= timeline.getSelectedFrames();
			}
			return {document:document, timeline:timeline};
		},

		toString:function()
		{
			return '[class JSFL]';
		}
	}

	xjsfl.classes.register('JSFLInterface', JSFLInterface);