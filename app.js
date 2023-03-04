let vertexShaderText =
  [
    'precision mediump float;', //this says I want to use medium precision on the floating point variables. This has something to do with the arithmetic/the comparisons. Lower precision means less accuracy but also faster.
    '',
    'attribute vec2 vertPosition;', //the types are going to be a lot different than they are on the C based languages, you do have float (would go right after attribute), like you do in the C based languages, but you also have the vec2, vec3, and vec4. These represent pairs, triplets, and four sets of floats that go together, so a vector of two elements would be like this one. This has an X and a Y component, both floats.
    '',
    'void main()',
    '{',
    // So what the code below is doing is it's saying a vec4 expects 4 numbers. Attribute vec2... has 2, so we're going to take the first two from it and then the third one and fourth one from the piece below
    '   gl_Position = vec4(vertPosition, 0.0, 1.0);', //here all I'm going to do is say that the position equals vector 4 because GL position is a four dimensional vector
    // Alpha is ALWAYS 1.0
    '}'
  ].join('\n'); //this is I have an array, and inside the array I'm going to put the lines of the vertex shader each on their own actual line on the file 



let fragmentShaderText =
  [
    'precision mediump float;',
    '',
    'void main()', //this one isn't taking in any additional parameters right now, I just want to color it
    '{',
    '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);', //this is just going to say the fragment color is going to be one on the red, so completely filled with red, no green, no blue, full on the alpha because it's not transparent.
    '}'
  ].join('\n');

// Now I need to get OpenGL ready to use these vertex shader and fragment shader (line 115)



let InitDemo = function () {
  // This will be what happens when the page is fully loaded and ready to go
  console.log('app.js connected')
  // Always check to make sure it's working

  // STEP 1: initialize WebGL
  // to do that we need two things; first is to get the actual canvas element
  let canvas = document.getElementById('game-surface')
  // Now we need to get the OpenGl context
  // @ts-ignore (it doesn't like getContext, but doesn't seem to be causing any actual issues with the code)
  let gl = canvas.getContext('webgl');

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
  // With a vertex shader what you do is you take in input parameters called attributes and if you're writing a C function the attributes would be parameters like this in JavaScript: 
  // function vertexShader(vertPosition, vertColor) {
  //   return {
  //     fragColor: vertColor,
  //     gl_Position: [vertPosition.x, vertPosition.y, 0.0, 1.0]
  //   }
  // };


  // And this is what it would look like the GL shader language (GLSL):
  /*
  precision mediump float;
  attribute vec2 vertPosition; //attributes are input parameters
  attribute vec3 vertColor;
  varying vec3 fragColor; //varying are output parameters

  //void main is the actual vertex shader that performs all the operations
  void main()
  {
    //here I'm just setting the fragment color to whatever the vertex color happens to be
    fragColor = vertColor;
    //with every vertex shader there's a special variable that you set called GL underscore position. This sets where on the actual rendering surface you want to draw that vertex. It then goes through the rasterizer and for every single pixel that comes out of that rasterizer state you draw with a fragment shader, which looks like the piece of code below this example
    gl_Position = vec4(vertPosition, 0.0, 1.0);
  }
  */


  /*
  precision mediump float;
  varying vex3 fragColor; //here the varying are now the inputs for the fragment shader

  void main()
  {
    gl_FragColor = vec4(fragColor, 1.0); //and the only output from the fragment shader will ever be this GL underscore frag color. In the parenthesis I'm taking the color that it's supposed to be and adding an alpha component
  }
  */



  // I'll make two variables first
  let vertexShader = gl.createShader(gl.VERTEX_SHADER); //the way to do this is I use OpenGL to create a new shader object and in the parenthesis I tell it what type of shader I want to use
  // a lot of these constants are using GL dot something, that's just the way WebGL does it because the OpenGL API uses a ton of these constants, just like gl.VERTEX_SHADER which ends up being a number
  // I'll do the same for the fragment shader
  let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  // Now what I want to do is compile the vertex shader from the code in vertexShaderText up on line 1 and the fragment shader from the fragmentShaderText code right below it. There's two steps to doing that
  // First I need to set the shader source. I do that through the GL shaders source. The first parameter is the shader that I want to set the the source code for, and the second parameter is the actual source code.
  gl.shaderSource(vertexShader, vertexShaderText);
  gl.shaderSource(fragmentShader, fragmentShaderText);

  // Now to actually compile it
  gl.compileShader(vertexShader);
  // a way we can check for compilation errors in the shaders is by using a function called GL dot get shader parameter, we need to tell it which shader we're examining and then which parameter we want to be getting
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error('ERROR compiling vertex shader', gl.getShaderInfoLog(vertexShader));
    return;
  }

  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error('ERROR compiling fragment shader', gl.getShaderInfoLog(fragmentShader));
    return;
  }



  // So now I have a vertex shader and a fragment shader that I'm already ready to use. Those are the two programs I have to write for the graphics pipeline
  // Now the last thing that I need to do is combine them. I need to tell OpenGL that these are the two programs that we want to use together and I'll do that by creating what's called a program in OpenGL. You can think of a program in this context as a graphics card/the entire graphics pipeline, whereas a shader is just an individual component
  var program = gl.createProgram();
  // then I want to attach both the vertex shader and the fragment shader
  gl.attachShader(program, vertexShader); //the gl.attachShader function takes in which program you want to attach the shader to and then which shader you actually want to use
  gl.attachShader(program, fragmentShader);

  // Now we need to link the program together. A good way to remember that is just compile then link, like a C program
  gl.linkProgram(program); //now, just like how I checked for compile error, I'll also check for linker errors
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('ERROR linking program', gl.getProgramInfoLog(program));
    return;
  }

  // one final step we can do to catch additional errors is called validating the program. This is something we only want to do in testing because as far as I'm aware it's more expensive. In actual C++ game writing this is something you would only do in the debug releases and not in the full releases because apparently it takes up more time
  gl.validateProgram(program); //I know it'll catch additional issues, but I don't know what issues those are exactly
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error('ERROR validating program', gl.getProgramInfoLog(program));
    return;
  }



  // Now I need to set the information that the graphics card is going to be using (28:50)
};



