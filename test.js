function initGL(canvas) {
  var gl;
  try {
    gl = canvas.getContext("experimental-webgl", {preserveDrawingBuffer: true});
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch (e) {
  }
  if (!gl) {
    alert("Could not initialise WebGL, sorry :-(");
  }
  return gl;
}

function getShader(id) {
  var shaderScript = document.getElementById(id);
  if (!shaderScript) {
    return null;
  }

  var str = "";
  var k = shaderScript.firstChild;
  while (k) {
    if (k.nodeType == 3) {
      str += k.textContent;
    }
    k = k.nextSibling;
  }

  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

function initShaders(type) {
  var shaderProgram;

  var fragmentShader = getShader(type+"-fs");
  var vertexShader = getShader("shader-vs");

  shaderProgram = gl.createProgram();
  
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
  
  shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
  shaderProgram.aUniform = gl.getUniformLocation(shaderProgram, "a");
  shaderProgram.bUniform = gl.getUniformLocation(shaderProgram, "b");
  shaderProgram.cUniform = gl.getUniformLocation(shaderProgram, "c");
  return shaderProgram;
}

function handleLoadedTexture(texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.bindTexture(gl.TEXTURE_2D, null);
}



function initTexture(src) {
  var tex;
  tex = gl.createTexture();
  tex.image = new Image();
  tex.image.onload = function () {
    handleLoadedTexture(tex);
  };
  tex.image.src = src;
  return tex;
}

function initBuffers() {
  var positionBuffer;
  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  vertices = [
      // Front face
      -1, -1,  0,
       1, -1,  0,
       1,  1,  0,
      -1,  1,  0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  positionBuffer.itemSize = 3;
  positionBuffer.numItems = 4;
  return positionBuffer;
}
var b = 0.2;
var a = 0.8;
var c = 1;
function draw(program,texture){
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(program.vertexPositionAttribute, buffer.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(program.samplerUniform, 0);
  
  gl.uniform1f(program.aUniform, a);
  gl.uniform1f(program.bUniform, b);
  gl.uniform1f(program.cUniform, c);
  gl.drawArrays(gl.TRIANGLE_FAN, 0,4);
}

function drawScene(){
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight/2);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  draw(recreate.program,recreate.texture);
}
var canvas = document.getElementById("canvas");
var gl = initGL(canvas);
var buffer = initBuffers();

var simulate = {};
simulate.program = initShaders('simulate');
simulate.texture = initTexture('test.gif');

var recreate = {};
recreate.program = initShaders('recreate');
recreate.texture = initTexture('test.png');

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.enable(gl.DEPTH_TEST);

document.onkeydown = function(e){
  if(e.keyCode == 40){
    b+=0.01;
  }
  if(e.keyCode == 39){
    a+=0.01;
  }
  if(e.keyCode == 38){
    b-=0.01;
  }
  if(e.keyCode == 37){
    a-=0.01;
  }
};
