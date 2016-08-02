/**
Copyright (c) 2014 The Chromium Authors. All rights reserved.
Use of this source code is governed by a BSD-style license that can be
found in the LICENSE file.
**/

require("../../base/base.js");

'use strict';

/**
 * @fileoverview Utilities for accessing trace data about the Chrome browser.
 */
global.tr.exportTo('tr.model.helpers', function() {
  var MAIN_FRAMETIME_TYPE = 'main_frametime_type';
  var IMPL_FRAMETIME_TYPE = 'impl_frametime_type';

  var MAIN_RENDERING_STATS =
      'BenchmarkInstrumentation::MainThreadRenderingStats';
  var IMPL_RENDERING_STATS =
      'BenchmarkInstrumentation::ImplThreadRenderingStats';


  function getSlicesIntersectingRange(rangeOfInterest, slices) {
    var slicesInFilterRange = [];
    for (var i = 0; i < slices.length; i++) {
      var slice = slices[i];
      if (rangeOfInterest.intersectsExplicitRangeInclusive(
            slice.start, slice.end))
        slicesInFilterRange.push(slice);
    }
    return slicesInFilterRange;
  }


  function ChromeProcessHelper(modelHelper, process) {
    this.modelHelper = modelHelper;
    this.process = process;
  }

  ChromeProcessHelper.prototype = {
    get pid() {
      return this.process.pid;
    },

    getFrameEventsInRange: function(frametimeType, range) {
      var titleToGet = (frametimeType === MAIN_FRAMETIME_TYPE ?
        MAIN_RENDERING_STATS : IMPL_RENDERING_STATS);

      var frameEvents = [];
      for (var event of this.process.getDescendantEvents())
        if (event.title === titleToGet)
          if (range.intersectsExplicitRangeInclusive(event.start, event.end))
            frameEvents.push(event);

      frameEvents.sort(function(a, b) {return a.start - b.start});
      return frameEvents;
    }
  };

  function getFrametimeDataFromEvents(frameEvents) {
    var frametimeData = [];
    for (var i = 1; i < frameEvents.length; i++) {
      var diff = frameEvents[i].start - frameEvents[i - 1].start;
      frametimeData.push({
        'x': frameEvents[i].start,
        'frametime': diff
      });
    }
    return frametimeData;
  }

  return {
    ChromeProcessHelper: ChromeProcessHelper,

    MAIN_FRAMETIME_TYPE: MAIN_FRAMETIME_TYPE,
    IMPL_FRAMETIME_TYPE: IMPL_FRAMETIME_TYPE,
    MAIN_RENDERING_STATS: MAIN_RENDERING_STATS,
    IMPL_RENDERING_STATS: IMPL_RENDERING_STATS,

    getSlicesIntersectingRange: getSlicesIntersectingRange,
    getFrametimeDataFromEvents: getFrametimeDataFromEvents
  };
});