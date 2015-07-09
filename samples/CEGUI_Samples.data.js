
var Module;

if (typeof Module === 'undefined') Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {
 var loadPackage = function(metadata) {

    var PACKAGE_PATH;
    if (typeof window === 'object') {
      PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    } else if (typeof location !== 'undefined') {
      // worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
    } else {
      throw 'using preloaded data can only be done on a web page or in a web worker';
    }
    var PACKAGE_NAME = '/home/chris/cegui-emscripten/build_em/CEGUI_Samples.data';
    var REMOTE_PACKAGE_BASE = 'CEGUI_Samples.data';
    if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
      Module['locateFile'] = Module['locateFilePackage'];
      Module.printErr('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
    }
    var REMOTE_PACKAGE_NAME = typeof Module['locateFile'] === 'function' ?
                              Module['locateFile'](REMOTE_PACKAGE_BASE) :
                              ((Module['filePackagePrefixURL'] || '') + REMOTE_PACKAGE_BASE);
  
      var REMOTE_PACKAGE_SIZE = 61932211;
      var PACKAGE_UUID = 'cd736e5c-8c74-4890-a53f-609249508c53';
    
    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        var size = packageSize;
        if (event.total) size = event.total;
        if (event.loaded) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: size
            };
          } else {
            Module.dataFileDownloads[url].loaded = event.loaded;
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
          var data = Module.dataFileDownloads[download];
            total += data.total;
            loaded += data.loaded;
            num++;
          }
          total = Math.ceil(total * Module.expectedDataFileDownloads/num);
          if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
        } else if (!Module.dataFileDownloads) {
          if (Module['setStatus']) Module['setStatus']('Downloading data...');
        }
      };
      xhr.onload = function(event) {
        var packageData = xhr.response;
        callback(packageData);
      };
      xhr.send(null);
    };

    function handleError(error) {
      console.error('package error:', error);
    };
  
      var fetched = null, fetchedCallback = null;
      fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);
    
  function runWithFS() {

    function assert(check, msg) {
      if (!check) throw msg + new Error().stack;
    }
Module['FS_createPath']('/', 'assets', true, true);
Module['FS_createPath']('/assets', 'layouts', true, true);
Module['FS_createPath']('/assets', 'looknfeel', true, true);
Module['FS_createPath']('/assets', 'fonts', true, true);
Module['FS_createPath']('/assets', 'schemes', true, true);
Module['FS_createPath']('/assets', 'animations', true, true);
Module['FS_createPath']('/assets', 'xml_schemas', true, true);
Module['FS_createPath']('/assets', 'samples', true, true);
Module['FS_createPath']('/assets', 'imagesets', true, true);
Module['FS_createPath']('/assets', 'lua_scripts', true, true);

    function DataRequest(start, end, crunched, audio) {
      this.start = start;
      this.end = end;
      this.crunched = crunched;
      this.audio = audio;
    }
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.name = name;
        this.requests[name] = this;
        Module['addRunDependency']('fp ' + this.name);
      },
      send: function() {},
      onload: function() {
        var byteArray = this.byteArray.subarray(this.start, this.end);

          this.finish(byteArray);

      },
      finish: function(byteArray) {
        var that = this;
        Module['FS_createPreloadedFile'](this.name, null, byteArray, true, true, function() {
          Module['removeRunDependency']('fp ' + that.name);
        }, function() {
          if (that.audio) {
            Module['removeRunDependency']('fp ' + that.name); // workaround for chromium bug 124926 (still no audio with this, but at least we don't hang)
          } else {
            Module.printErr('Preloading file ' + that.name + ' failed');
          }
        }, false, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
        this.requests[this.name] = null;
      },
    };

      new DataRequest(0, 603, 0, 0).open('GET', '/assets/CMakeLists.txt');
    new DataRequest(603, 19029, 0, 0).open('GET', '/assets/layouts/HUDDemoIngame.layout');
    new DataRequest(19029, 76893, 0, 0).open('GET', '/assets/layouts/GameMenu.layout');
    new DataRequest(76893, 87274, 0, 0).open('GET', '/assets/layouts/FontDemo.layout');
    new DataRequest(87274, 88560, 0, 0).open('GET', '/assets/layouts/EffectsDemo.layout');
    new DataRequest(88560, 89824, 0, 0).open('GET', '/assets/layouts/Console.wnd');
    new DataRequest(89824, 117387, 0, 0).open('GET', '/assets/layouts/TaharezLookOverview.layout');
    new DataRequest(117387, 121078, 0, 0).open('GET', '/assets/layouts/TabPage1.layout');
    new DataRequest(121078, 122326, 0, 0).open('GET', '/assets/layouts/SampleBrowserLoadScreen.layout');
    new DataRequest(122326, 136688, 0, 0).open('GET', '/assets/layouts/SampleBrowser.layout');
    new DataRequest(136688, 152593, 0, 0).open('GET', '/assets/layouts/VanillaLookOverview.layout');
    new DataRequest(152593, 160217, 0, 0).open('GET', '/assets/layouts/Demo8.layout');
    new DataRequest(160217, 162209, 0, 0).open('GET', '/assets/layouts/HUDDemoGameOver.layout');
    new DataRequest(162209, 163097, 0, 0).open('GET', '/assets/layouts/application_templates.layout');
    new DataRequest(163097, 167220, 0, 0).open('GET', '/assets/layouts/VanillaWindows.layout');
    new DataRequest(167220, 171456, 0, 0).open('GET', '/assets/layouts/DragDropDemo.layout');
    new DataRequest(171456, 172494, 0, 0).open('GET', '/assets/layouts/TabControlDemo.layout');
    new DataRequest(172494, 173776, 0, 0).open('GET', '/assets/layouts/TabPage.layout');
    new DataRequest(173776, 175131, 0, 0).open('GET', '/assets/layouts/TreeDemoTaharez.layout');
    new DataRequest(175131, 185846, 0, 0).open('GET', '/assets/layouts/TextDemo.layout');
    new DataRequest(185846, 187901, 0, 0).open('GET', '/assets/layouts/VanillaConsole.layout');
    new DataRequest(187901, 189739, 0, 0).open('GET', '/assets/layouts/TabPage2.layout');
    new DataRequest(189739, 192914, 0, 0).open('GET', '/assets/looknfeel/InventoryComponents.looknfeel');
    new DataRequest(192914, 418028, 0, 0).open('GET', '/assets/looknfeel/OgreTray.looknfeel');
    new DataRequest(418028, 490420, 0, 0).open('GET', '/assets/looknfeel/VanillaCommonDialogs.looknfeel');
    new DataRequest(490420, 725245, 0, 0).open('GET', '/assets/looknfeel/WindowsLook.looknfeel');
    new DataRequest(725245, 828980, 0, 0).open('GET', '/assets/looknfeel/Vanilla.looknfeel');
    new DataRequest(828980, 833568, 0, 0).open('GET', '/assets/looknfeel/GameMenu.looknfeel');
    new DataRequest(833568, 845727, 0, 0).open('GET', '/assets/looknfeel/Generic.looknfeel');
    new DataRequest(845727, 851562, 0, 0).open('GET', '/assets/looknfeel/HUDDemo.looknfeel');
    new DataRequest(851562, 1050003, 0, 0).open('GET', '/assets/looknfeel/TaharezLook.looknfeel');
    new DataRequest(1050003, 1113471, 0, 0).open('GET', '/assets/looknfeel/SampleBrowser.looknfeel');
    new DataRequest(1113471, 1223646, 0, 0).open('GET', '/assets/looknfeel/AlfiskoSkin.looknfeel');
    new DataRequest(1223646, 1317170, 0, 0).open('GET', '/assets/fonts/Futhark Adapted.ttf');
    new DataRequest(1317170, 1656110, 0, 0).open('GET', '/assets/fonts/Jura-Regular.ttf');
    new DataRequest(1656110, 1678994, 0, 0).open('GET', '/assets/fonts/RichStyle.ttf');
    new DataRequest(1678994, 2005134, 0, 0).open('GET', '/assets/fonts/Jura-DemiBold.ttf');
    new DataRequest(2005134, 2023926, 0, 0).open('GET', '/assets/fonts/Tnua-Libre.ttf');
    new DataRequest(2023926, 2024105, 0, 0).open('GET', '/assets/fonts/DejaVuSans-12.font');
    new DataRequest(2024105, 2042197, 0, 0).open('GET', '/assets/fonts/LicenseGPL.txt');
    new DataRequest(2042197, 2042369, 0, 0).open('GET', '/assets/fonts/Junicode-13.font');
    new DataRequest(2042369, 2043580, 0, 0).open('GET', '/assets/fonts/FairChar-30.font');
    new DataRequest(2043580, 2047709, 0, 0).open('GET', '/assets/fonts/LicenseSIL.txt');
    new DataRequest(2047709, 2047885, 0, 0).open('GET', '/assets/fonts/Jura-10.font');
    new DataRequest(2047885, 2393709, 0, 0).open('GET', '/assets/fonts/Jura-Medium.ttf');
    new DataRequest(2393709, 2393885, 0, 0).open('GET', '/assets/fonts/Jura-13.font');
    new DataRequest(2393885, 2394069, 0, 0).open('GET', '/assets/fonts/DejaVuSans-12-NoScale.font');
    new DataRequest(2394069, 2394253, 0, 0).open('GET', '/assets/fonts/DejaVuSans-14-NoScale.font');
    new DataRequest(2394253, 3485801, 0, 0).open('GET', '/assets/fonts/Junicode.ttf');
    new DataRequest(3485801, 3485972, 0, 0).open('GET', '/assets/fonts/Batang-18.font');
    new DataRequest(3485972, 3752716, 0, 0).open('GET', '/assets/fonts/Jura-Light.ttf');
    new DataRequest(3752716, 17692152, 0, 0).open('GET', '/assets/fonts/batang.ttf');
    new DataRequest(17692152, 17702403, 0, 0).open('GET', '/assets/fonts/Legal.txt');
    new DataRequest(17702403, 17703491, 0, 0).open('GET', '/assets/fonts/LicenseMIT.txt');
    new DataRequest(17703491, 17714186, 0, 0).open('GET', '/assets/fonts/LicenseApache.txt');
    new DataRequest(17714186, 17814106, 0, 0).open('GET', '/assets/fonts/Klingon-pIqaD-HaSta.ttf');
    new DataRequest(17814106, 17814282, 0, 0).open('GET', '/assets/fonts/Jura-18.font');
    new DataRequest(17814282, 18031274, 0, 0).open('GET', '/assets/fonts/IMFePIrm29P.ttf');
    new DataRequest(18031274, 18180434, 0, 0).open('GET', '/assets/fonts/FetteClassicUNZFraktur.ttf');
    new DataRequest(18180434, 18900446, 0, 0).open('GET', '/assets/fonts/DejaVuSans.ttf');
    new DataRequest(18900446, 18938886, 0, 0).open('GET', '/assets/fonts/mizufalp.ttf');
    new DataRequest(18938886, 18939065, 0, 0).open('GET', '/assets/fonts/DejaVuSans-14.font');
    new DataRequest(18939065, 18939251, 0, 0).open('GET', '/assets/fonts/GreatVibes-16.font');
    new DataRequest(18939251, 18944067, 0, 0).open('GET', '/assets/fonts/LicenseDejaVu.txt');
    new DataRequest(18944067, 18947046, 0, 0).open('GET', '/assets/fonts/LicenseUbuntuFont.txt');
    new DataRequest(18947046, 18947225, 0, 0).open('GET', '/assets/fonts/DejaVuSans-10.font');
    new DataRequest(18947225, 18947409, 0, 0).open('GET', '/assets/fonts/DejaVuSans-10-NoScale.font');
    new DataRequest(18947409, 18947595, 0, 0).open('GET', '/assets/fonts/GreatVibes-22.font');
    new DataRequest(18947595, 19310795, 0, 0).open('GET', '/assets/fonts/DejaVuSerif.ttf');
    new DataRequest(19310795, 19416799, 0, 0).open('GET', '/assets/fonts/GreatVibes-Regular.ttf');
    new DataRequest(19416799, 19417278, 0, 0).open('GET', '/assets/schemes/GameMenu.scheme');
    new DataRequest(19417278, 19424208, 0, 0).open('GET', '/assets/schemes/OgreTray.scheme');
    new DataRequest(19424208, 19424936, 0, 0).open('GET', '/assets/schemes/Generic.scheme');
    new DataRequest(19424936, 19431206, 0, 0).open('GET', '/assets/schemes/WindowsLook.scheme');
    new DataRequest(19431206, 19433702, 0, 0).open('GET', '/assets/schemes/SampleBrowser.scheme');
    new DataRequest(19433702, 19434247, 0, 0).open('GET', '/assets/schemes/HUDDemo.scheme');
    new DataRequest(19434247, 19441218, 0, 0).open('GET', '/assets/schemes/TaharezLook.scheme');
    new DataRequest(19441218, 19447700, 0, 0).open('GET', '/assets/schemes/AlfiskoSkin.scheme');
    new DataRequest(19447700, 19449240, 0, 0).open('GET', '/assets/schemes/VanillaCommonDialogs.scheme');
    new DataRequest(19449240, 19452171, 0, 0).open('GET', '/assets/schemes/VanillaSkin.scheme');
    new DataRequest(19452171, 19452987, 0, 0).open('GET', '/assets/animations/example.anims');
    new DataRequest(19452987, 19468409, 0, 0).open('GET', '/assets/animations/GameMenu.anims');
    new DataRequest(19468409, 19496994, 0, 0).open('GET', '/assets/xml_schemas/Falagard.xsd');
    new DataRequest(19496994, 19498176, 0, 0).open('GET', '/assets/xml_schemas/Samples.xsd');
    new DataRequest(19498176, 19499828, 0, 0).open('GET', '/assets/xml_schemas/Imageset.xsd');
    new DataRequest(19499828, 19502001, 0, 0).open('GET', '/assets/xml_schemas/Font.xsd');
    new DataRequest(19502001, 19505023, 0, 0).open('GET', '/assets/xml_schemas/GUILayout.xsd');
    new DataRequest(19505023, 19508469, 0, 0).open('GET', '/assets/xml_schemas/Animation.xsd');
    new DataRequest(19508469, 19513229, 0, 0).open('GET', '/assets/xml_schemas/CEGUIConfig.xsd');
    new DataRequest(19513229, 19516219, 0, 0).open('GET', '/assets/xml_schemas/GUIScheme.xsd');
    new DataRequest(19516219, 19525776, 0, 0).open('GET', '/assets/samples/samples.xml');
    new DataRequest(19525776, 19757749, 0, 0).open('GET', '/assets/imagesets/GameMenu.png');
    new DataRequest(19757749, 19771757, 0, 0).open('GET', '/assets/imagesets/vanilla.png');
    new DataRequest(19771757, 19784148, 0, 0).open('GET', '/assets/imagesets/WindowsLook.imageset');
    new DataRequest(19784148, 19787736, 0, 0).open('GET', '/assets/imagesets/GameMenu.imageset');
    new DataRequest(19787736, 19795459, 0, 0).open('GET', '/assets/imagesets/WindowsLook.png');
    new DataRequest(19795459, 19796371, 0, 0).open('GET', '/assets/imagesets/ReadMe.txt');
    new DataRequest(19796371, 19832205, 0, 0).open('GET', '/assets/imagesets/DriveIcons.png');
    new DataRequest(19832205, 20093504, 0, 0).open('GET', '/assets/imagesets/SampleBrowser.png');
    new DataRequest(20093504, 20473183, 0, 0).open('GET', '/assets/imagesets/HUDDemo.png');
    new DataRequest(20473183, 20475435, 0, 0).open('GET', '/assets/imagesets/FairChar.imageset');
    new DataRequest(20475435, 20582731, 0, 0).open('GET', '/assets/imagesets/AlfiskoSkin.png');
    new DataRequest(20582731, 26360024, 0, 0).open('GET', '/assets/imagesets/SpaceBackground.png');
    new DataRequest(26360024, 26379746, 0, 0).open('GET', '/assets/imagesets/logo.png');
    new DataRequest(26379746, 28045325, 0, 0).open('GET', '/assets/imagesets/BackgroundSampleBrowser.png');
    new DataRequest(28045325, 28051344, 0, 0).open('GET', '/assets/imagesets/SampleBrowser.imageset');
    new DataRequest(28051344, 28077974, 0, 0).open('GET', '/assets/imagesets/TaharezLook.png');
    new DataRequest(28077974, 28082186, 0, 0).open('GET', '/assets/imagesets/Vanilla.imageset');
    new DataRequest(28082186, 28100750, 0, 0).open('GET', '/assets/imagesets/FairChar.png');
    new DataRequest(28100750, 28108446, 0, 0).open('GET', '/assets/imagesets/OgreTray.imageset');
    new DataRequest(28108446, 28123164, 0, 0).open('GET', '/assets/imagesets/AlfiskoSkin.imageset');
    new DataRequest(28123164, 28166295, 0, 0).open('GET', '/assets/imagesets/OgreTrayImages.png');
    new DataRequest(28166295, 61847234, 0, 0).open('GET', '/assets/imagesets/Aliasing.png');
    new DataRequest(61847234, 61867754, 0, 0).open('GET', '/assets/imagesets/TaharezLook.imageset');
    new DataRequest(61867754, 61870162, 0, 0).open('GET', '/assets/imagesets/HUDDemo.imageset');
    new DataRequest(61870162, 61927434, 0, 0).open('GET', '/assets/imagesets/HUDDemoGameOver.png');
    new DataRequest(61927434, 61928215, 0, 0).open('GET', '/assets/imagesets/DriveIcons.imageset');
    new DataRequest(61928215, 61932211, 0, 0).open('GET', '/assets/lua_scripts/demo8.lua');

    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
      
      // copy the entire loaded file into a spot in the heap. Files will refer to slices in that. They cannot be freed though
      // (we may be allocating before malloc is ready, during startup).
      var ptr = Module['getMemory'](byteArray.length);
      Module['HEAPU8'].set(byteArray, ptr);
      DataRequest.prototype.byteArray = Module['HEAPU8'].subarray(ptr, ptr+byteArray.length);
          DataRequest.prototype.requests["/assets/CMakeLists.txt"].onload();
          DataRequest.prototype.requests["/assets/layouts/HUDDemoIngame.layout"].onload();
          DataRequest.prototype.requests["/assets/layouts/GameMenu.layout"].onload();
          DataRequest.prototype.requests["/assets/layouts/FontDemo.layout"].onload();
          DataRequest.prototype.requests["/assets/layouts/EffectsDemo.layout"].onload();
          DataRequest.prototype.requests["/assets/layouts/Console.wnd"].onload();
          DataRequest.prototype.requests["/assets/layouts/TaharezLookOverview.layout"].onload();
          DataRequest.prototype.requests["/assets/layouts/TabPage1.layout"].onload();
          DataRequest.prototype.requests["/assets/layouts/SampleBrowserLoadScreen.layout"].onload();
          DataRequest.prototype.requests["/assets/layouts/SampleBrowser.layout"].onload();
          DataRequest.prototype.requests["/assets/layouts/VanillaLookOverview.layout"].onload();
          DataRequest.prototype.requests["/assets/layouts/Demo8.layout"].onload();
          DataRequest.prototype.requests["/assets/layouts/HUDDemoGameOver.layout"].onload();
          DataRequest.prototype.requests["/assets/layouts/application_templates.layout"].onload();
          DataRequest.prototype.requests["/assets/layouts/VanillaWindows.layout"].onload();
          DataRequest.prototype.requests["/assets/layouts/DragDropDemo.layout"].onload();
          DataRequest.prototype.requests["/assets/layouts/TabControlDemo.layout"].onload();
          DataRequest.prototype.requests["/assets/layouts/TabPage.layout"].onload();
          DataRequest.prototype.requests["/assets/layouts/TreeDemoTaharez.layout"].onload();
          DataRequest.prototype.requests["/assets/layouts/TextDemo.layout"].onload();
          DataRequest.prototype.requests["/assets/layouts/VanillaConsole.layout"].onload();
          DataRequest.prototype.requests["/assets/layouts/TabPage2.layout"].onload();
          DataRequest.prototype.requests["/assets/looknfeel/InventoryComponents.looknfeel"].onload();
          DataRequest.prototype.requests["/assets/looknfeel/OgreTray.looknfeel"].onload();
          DataRequest.prototype.requests["/assets/looknfeel/VanillaCommonDialogs.looknfeel"].onload();
          DataRequest.prototype.requests["/assets/looknfeel/WindowsLook.looknfeel"].onload();
          DataRequest.prototype.requests["/assets/looknfeel/Vanilla.looknfeel"].onload();
          DataRequest.prototype.requests["/assets/looknfeel/GameMenu.looknfeel"].onload();
          DataRequest.prototype.requests["/assets/looknfeel/Generic.looknfeel"].onload();
          DataRequest.prototype.requests["/assets/looknfeel/HUDDemo.looknfeel"].onload();
          DataRequest.prototype.requests["/assets/looknfeel/TaharezLook.looknfeel"].onload();
          DataRequest.prototype.requests["/assets/looknfeel/SampleBrowser.looknfeel"].onload();
          DataRequest.prototype.requests["/assets/looknfeel/AlfiskoSkin.looknfeel"].onload();
          DataRequest.prototype.requests["/assets/fonts/Futhark Adapted.ttf"].onload();
          DataRequest.prototype.requests["/assets/fonts/Jura-Regular.ttf"].onload();
          DataRequest.prototype.requests["/assets/fonts/RichStyle.ttf"].onload();
          DataRequest.prototype.requests["/assets/fonts/Jura-DemiBold.ttf"].onload();
          DataRequest.prototype.requests["/assets/fonts/Tnua-Libre.ttf"].onload();
          DataRequest.prototype.requests["/assets/fonts/DejaVuSans-12.font"].onload();
          DataRequest.prototype.requests["/assets/fonts/LicenseGPL.txt"].onload();
          DataRequest.prototype.requests["/assets/fonts/Junicode-13.font"].onload();
          DataRequest.prototype.requests["/assets/fonts/FairChar-30.font"].onload();
          DataRequest.prototype.requests["/assets/fonts/LicenseSIL.txt"].onload();
          DataRequest.prototype.requests["/assets/fonts/Jura-10.font"].onload();
          DataRequest.prototype.requests["/assets/fonts/Jura-Medium.ttf"].onload();
          DataRequest.prototype.requests["/assets/fonts/Jura-13.font"].onload();
          DataRequest.prototype.requests["/assets/fonts/DejaVuSans-12-NoScale.font"].onload();
          DataRequest.prototype.requests["/assets/fonts/DejaVuSans-14-NoScale.font"].onload();
          DataRequest.prototype.requests["/assets/fonts/Junicode.ttf"].onload();
          DataRequest.prototype.requests["/assets/fonts/Batang-18.font"].onload();
          DataRequest.prototype.requests["/assets/fonts/Jura-Light.ttf"].onload();
          DataRequest.prototype.requests["/assets/fonts/batang.ttf"].onload();
          DataRequest.prototype.requests["/assets/fonts/Legal.txt"].onload();
          DataRequest.prototype.requests["/assets/fonts/LicenseMIT.txt"].onload();
          DataRequest.prototype.requests["/assets/fonts/LicenseApache.txt"].onload();
          DataRequest.prototype.requests["/assets/fonts/Klingon-pIqaD-HaSta.ttf"].onload();
          DataRequest.prototype.requests["/assets/fonts/Jura-18.font"].onload();
          DataRequest.prototype.requests["/assets/fonts/IMFePIrm29P.ttf"].onload();
          DataRequest.prototype.requests["/assets/fonts/FetteClassicUNZFraktur.ttf"].onload();
          DataRequest.prototype.requests["/assets/fonts/DejaVuSans.ttf"].onload();
          DataRequest.prototype.requests["/assets/fonts/mizufalp.ttf"].onload();
          DataRequest.prototype.requests["/assets/fonts/DejaVuSans-14.font"].onload();
          DataRequest.prototype.requests["/assets/fonts/GreatVibes-16.font"].onload();
          DataRequest.prototype.requests["/assets/fonts/LicenseDejaVu.txt"].onload();
          DataRequest.prototype.requests["/assets/fonts/LicenseUbuntuFont.txt"].onload();
          DataRequest.prototype.requests["/assets/fonts/DejaVuSans-10.font"].onload();
          DataRequest.prototype.requests["/assets/fonts/DejaVuSans-10-NoScale.font"].onload();
          DataRequest.prototype.requests["/assets/fonts/GreatVibes-22.font"].onload();
          DataRequest.prototype.requests["/assets/fonts/DejaVuSerif.ttf"].onload();
          DataRequest.prototype.requests["/assets/fonts/GreatVibes-Regular.ttf"].onload();
          DataRequest.prototype.requests["/assets/schemes/GameMenu.scheme"].onload();
          DataRequest.prototype.requests["/assets/schemes/OgreTray.scheme"].onload();
          DataRequest.prototype.requests["/assets/schemes/Generic.scheme"].onload();
          DataRequest.prototype.requests["/assets/schemes/WindowsLook.scheme"].onload();
          DataRequest.prototype.requests["/assets/schemes/SampleBrowser.scheme"].onload();
          DataRequest.prototype.requests["/assets/schemes/HUDDemo.scheme"].onload();
          DataRequest.prototype.requests["/assets/schemes/TaharezLook.scheme"].onload();
          DataRequest.prototype.requests["/assets/schemes/AlfiskoSkin.scheme"].onload();
          DataRequest.prototype.requests["/assets/schemes/VanillaCommonDialogs.scheme"].onload();
          DataRequest.prototype.requests["/assets/schemes/VanillaSkin.scheme"].onload();
          DataRequest.prototype.requests["/assets/animations/example.anims"].onload();
          DataRequest.prototype.requests["/assets/animations/GameMenu.anims"].onload();
          DataRequest.prototype.requests["/assets/xml_schemas/Falagard.xsd"].onload();
          DataRequest.prototype.requests["/assets/xml_schemas/Samples.xsd"].onload();
          DataRequest.prototype.requests["/assets/xml_schemas/Imageset.xsd"].onload();
          DataRequest.prototype.requests["/assets/xml_schemas/Font.xsd"].onload();
          DataRequest.prototype.requests["/assets/xml_schemas/GUILayout.xsd"].onload();
          DataRequest.prototype.requests["/assets/xml_schemas/Animation.xsd"].onload();
          DataRequest.prototype.requests["/assets/xml_schemas/CEGUIConfig.xsd"].onload();
          DataRequest.prototype.requests["/assets/xml_schemas/GUIScheme.xsd"].onload();
          DataRequest.prototype.requests["/assets/samples/samples.xml"].onload();
          DataRequest.prototype.requests["/assets/imagesets/GameMenu.png"].onload();
          DataRequest.prototype.requests["/assets/imagesets/vanilla.png"].onload();
          DataRequest.prototype.requests["/assets/imagesets/WindowsLook.imageset"].onload();
          DataRequest.prototype.requests["/assets/imagesets/GameMenu.imageset"].onload();
          DataRequest.prototype.requests["/assets/imagesets/WindowsLook.png"].onload();
          DataRequest.prototype.requests["/assets/imagesets/ReadMe.txt"].onload();
          DataRequest.prototype.requests["/assets/imagesets/DriveIcons.png"].onload();
          DataRequest.prototype.requests["/assets/imagesets/SampleBrowser.png"].onload();
          DataRequest.prototype.requests["/assets/imagesets/HUDDemo.png"].onload();
          DataRequest.prototype.requests["/assets/imagesets/FairChar.imageset"].onload();
          DataRequest.prototype.requests["/assets/imagesets/AlfiskoSkin.png"].onload();
          DataRequest.prototype.requests["/assets/imagesets/SpaceBackground.png"].onload();
          DataRequest.prototype.requests["/assets/imagesets/logo.png"].onload();
          DataRequest.prototype.requests["/assets/imagesets/BackgroundSampleBrowser.png"].onload();
          DataRequest.prototype.requests["/assets/imagesets/SampleBrowser.imageset"].onload();
          DataRequest.prototype.requests["/assets/imagesets/TaharezLook.png"].onload();
          DataRequest.prototype.requests["/assets/imagesets/Vanilla.imageset"].onload();
          DataRequest.prototype.requests["/assets/imagesets/FairChar.png"].onload();
          DataRequest.prototype.requests["/assets/imagesets/OgreTray.imageset"].onload();
          DataRequest.prototype.requests["/assets/imagesets/AlfiskoSkin.imageset"].onload();
          DataRequest.prototype.requests["/assets/imagesets/OgreTrayImages.png"].onload();
          DataRequest.prototype.requests["/assets/imagesets/Aliasing.png"].onload();
          DataRequest.prototype.requests["/assets/imagesets/TaharezLook.imageset"].onload();
          DataRequest.prototype.requests["/assets/imagesets/HUDDemo.imageset"].onload();
          DataRequest.prototype.requests["/assets/imagesets/HUDDemoGameOver.png"].onload();
          DataRequest.prototype.requests["/assets/imagesets/DriveIcons.imageset"].onload();
          DataRequest.prototype.requests["/assets/lua_scripts/demo8.lua"].onload();
          Module['removeRunDependency']('datafile_/home/chris/cegui-emscripten/build_em/CEGUI_Samples.data');

    };
    Module['addRunDependency']('datafile_/home/chris/cegui-emscripten/build_em/CEGUI_Samples.data');
  
    if (!Module.preloadResults) Module.preloadResults = {};
  
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }
    
  }
  if (Module['calledRun']) {
    runWithFS();
  } else {
    if (!Module['preRun']) Module['preRun'] = [];
    Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
  }

 }
 loadPackage();

})();
