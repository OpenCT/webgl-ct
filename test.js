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



function initTexture(program,src) {
  var tex;
  gl.useProgram(program);
  tex = gl.createTexture();
  tex.image = new Image();
  tex.image.onload = function () {
    handleLoadedTexture(tex);
  };
  tex.image.src = src;
  return tex;
}

var rttFramebuffer;
var rttTexture;

function initTextureFramebuffer() {
    rttFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);
    rttFramebuffer.width = 512;
    rttFramebuffer.height = 512;

    rttTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, rttTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, rttFramebuffer.width, rttFramebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    var renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, rttFramebuffer.width, rttFramebuffer.height);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rttTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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
var b = 0.8;
var a = 0.8;
var c = 1;
function draw(program,texture){
  gl.useProgram(program);
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
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, rttFramebuffer.width, rttFramebuffer.height);
    draw(simulate.program,simulate.texture);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  
  gl.viewport(0,0, gl.viewportWidth/3, gl.viewportHeight);
  draw(simple.program,simple.texture);
  gl.viewport(gl.viewportWidth/3, 0, gl.viewportWidth/3, gl.viewportHeight);
  draw(simulate.program,simulate.texture);
  gl.viewport(gl.viewportWidth*2/3,0, gl.viewportWidth/3, gl.viewportHeight);
  draw(recreate.program,rttTexture);
  drawing = false;
}

var canvas = document.getElementById("canvas");
var gl = initGL(canvas);
var buffer = initBuffers();
initTextureFramebuffer();
var simple = {};
simple.program = initShaders('simple');
simple.texture = initTexture(simple.program,'test.gif');

var simulate = {};
simulate.program = initShaders('simulate');
simulate.texture = initTexture(simulate.program,'test.gif');

var recreate = {};
recreate.program = initShaders('recreate');
recreate.texture = initTexture(recreate.program,'test.png');

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.enable(gl.DEPTH_TEST);

var drawing = false;
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
  if(!drawing){
    requestAnimationFrame(drawScene);
    drawing = true;
  }
};
