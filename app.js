var InitDemo = function () {
  // This will be what happens when the page is fully loaded and ready to go
  console.log('This is working') // Always check to make sure it's working

  // STEP 1: initialize WebGL
  // to do that we need two things; first is to get the actual canvas element
  var canvas = document.getElementById('game-surface')
  // Now we need to get the OpenGl context
  // @ts-ignore (it doesn't like getContext, but doesn't seem to be causing any actual issues with the code)
  var gl = canvas.getContext('webgl');

  if (!gl) {
    console.log('WebGL not supported, falling back on experiment-webgl')
    // @ts-ignore
    gl = canvas.getContext('experimental-webgl');
  }
  if (!gl) {
    alert('Your browser does not support WebGL')
  }



  // If I wanted to adjust the size of the canvas at this point I could by saying:
  /* canvas.width = window.innerWidth;
    canvas.height = window.innerHeight; */
  // If we do any dynamic size adjustments also be sure to say this:
  /* gl.viewport(0, 0, window.innerWidth, window.innerHeight) */
  // The above code just changes what OpenGL thinks that it's rendering to



  // Now lets clear our OpenGL context to a flat color
  gl.clearColor(0.75, 0.85, 0.8, 1.0) // In the (R, G, B, A) we give it a Red, Green, Blue, and Alpha value. Alpha is always going to be 1.0, which just means opaque. Anything less means transparent all the way down to zero which means invisible.
  // gl.clearColor(R, G, B, A) is just like setting the color of the paint our app will be using. It won't actually make any changes yet
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // The way we actually perform the color change is with a GL clear call. It requires and argument though
  // Without going into too much detail, graphics applications have multiple buffers that they render to. The only ones we really need to worry about right now are the color buffer and the depth buffer
  // The color buffer is the one that actually stores what color all the pixels should be
  // The depth buffer stores how deep into the screen that pixel was, so it's really good for Z ordering
  // EX: Let's say you have a circle and a square, and the circle is behind the square. The depth buffer, when it draws a pixel from the square, might put a value lower than the value of the circle, which means that it's closer to the screen. So if the program goes to draw a pixel from the circle and it notices that that pixel from the square is already there it will just throw it away and ignore it because the depth buffer already had a value that supersedes what was attempted to be drawn



  // Now what we need to do in order to get the triangle going we have to set up the entire graphics pipeline program in order to get this to work
  // We're going to need a vertex shader and a fragment shader
  // With a vertex shader what you do is you take in input parameters called attributes and if you're writing a C function 
};