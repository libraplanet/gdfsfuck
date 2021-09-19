var shell = new ActiveXObject('WScript.Shell');
var fs = new ActiveXObject('Scripting.FileSystemObject');

/**
 * println.
 * @param obj
 */
function println(obj) {
  WScript.Echo(obj);
  //WScript.StdOut.WriteLine(obj);
}

/**
 * getPatchStr.
 * @param str
 * @return string for use for patchwork.
 */
function getPatchStr(str) {
  var ret = '';
  if(str != null) {
    ret += str;
  }
  ret = ret.replace(new RegExp(' ', 'g'), '');
  //ret = ret.replace(new RegExp('-', 'g'), '');
  ret = ret.toLowerCase();
  return ret;
}

/**
 * loadHexText.
 * @param path
 * @return
 */
function loadHexText(path) {
  var bytes  = null;
  var hex = null;
  (function() {
    var stream = new ActiveXObject("ADODB.Stream");
    stream.Type = 1;
    stream.Open();
    stream.LoadFromFile(path);
    bytes  = stream.Read();
    stream.close();
  })();
  (function() {
    var domdoc = new ActiveXObject("Msxml2.DOMDocument");
    var elm = domdoc.createElement("hex");
    elm.dataType = "bin.hex";
    elm.nodeTypedValue = bytes;
    hex = elm.text;
  })();
  return hex;
}

/**
 * saveHexText.
 * @param path
 * @param str
 */
function saveHexText(path, str) {
  var hex = str;
  var bytes  = null;
  (function() {
    var domdoc = new ActiveXObject("Msxml2.DOMDocument");
    var elm = domdoc.createElement("hex");
    elm.dataType = "bin.hex";
    elm.text = hex;
    bytes = elm.nodeTypedValue;
  })();
  (function() {
    var stream = new ActiveXObject("ADODB.Stream");
    stream.Type = 1;
    stream.Open();
    stream.Write(bytes);
    stream.SaveToFile(path, 2)
    stream.Close()
  })();
}

/**
 * patchwork.
 * 
 * @param txt
 * @param strSrc
 * @param strDst
 * @return
 */
function patchwork(txt, strSrc, strDst) {
  var reg = new RegExp(strSrc, 'ig');

  if(!txt.match(reg)) {
    // not found
    throw new Error('replace string "' + strSrc + '" is not found...');
  } 

  return txt.replace(reg, strDst);
}

/**
 * main entry point.
 *
 * @return returncode 0 or -1.
 */
function main() {
  var args = WScript.Arguments;
  var srcFileName;
  var dstFileName;
  var patchOrg0;
  var patchDst0;

  (function() {
    var lines = [];
    lines.push('//-------------------------------------------------------');
    lines.push('// patcher on WHS.');
    lines.push('//-------------------------------------------------------');
    lines.push('usage:');
    lines.push('  patcher.js [source file] [dist file] [find str] [replace str]');
    lines.push('    source file       source file name or path for patchwork');
    lines.push('    dist file         dist file name or path for patchwork');
    lines.push('    find str(regexp)  string of search for patch.');
    lines.push('                      it trim white space, when use.');
    lines.push('    replace str       string of replace for patch.');
    lines.push('');
    lines.push('');
    lines.push('');
    println(lines.join('\n'));
  })();

  try {
    var patchOrg1;
    var patchDst1;
    var hexStr0, hexStr1;

    srcFileName = args(0);
    dstFileName = args(1);
    patchOrg0 = args(2);
    patchDst0 = args(3);

    patchOrg1 = getPatchStr(patchOrg0);
    patchDst1 = getPatchStr(patchDst0);

    println('');
    println('[init]');
    println('  srcFileName = ' + srcFileName);
    println('  dstFileName = ' + dstFileName);
    println('  patchOrg    = '    + patchOrg0 + ' (' + patchOrg1 + ')');
    println('  patchDst    = '    + patchDst0 + ' (' + patchDst1 + ')');

    println('');
    println('[loadHexText()]');
    hexStr0 = loadHexText(srcFileName);

    println('');
    println('[patchwork()]');
    hexStr1 = patchwork(hexStr0, patchOrg1, patchDst1);

    println('');
    println('[saveHexText()]');
    saveHexText(dstFileName, hexStr1);
    
  } catch(e) {
    throw e;
    //println('');
    //println('appear exception!');
    //println(e);
    //println('name        :' + e.name);
    //println('message     :' + e.message);
    //println('stack       :' + e.stack);
    //println('fileName    :' + e.fileName);
    //println('lineNumber  :' + e.lineNumber);
    //println('number      :' + e.number);
    //println('description :' + e.description);
    //WScript.Quit(-1);
  }
}

main();
