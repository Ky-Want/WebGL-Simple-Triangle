let vertexShaderText =
  [
    'precision mediump float;', //this says I want to use medium precision on the floating point variables. This has something to do with the arithmetic/the comparisons. Lower precision means less accuracy but also faster.
    '',
    'attribute vec2 vertPosition;', //the types are going to be a lot different than they are on the C based languages, you do have float (would go right after attribute), like you do in the C based languages, but you also have the vec2, vec3, and vec4. These represent pairs, triplets, and four sets of floats that go together, so a vector of two elements would be like this one. This has an X and a Y component, both floats.

    'attribute vec3 vertColor;',
    'varying vec3 fragColor;',

    // 'uniform float screenWidth;', 
    // uniforms are constants that stay the same between the vertex shader and the fragment shader

    '',
    'void main()',
    '{',
    '    fragColor = vertColor;',
    // So what the code below is doing is it's saying a vec4 expects 4 numbers. Attribute vec2... has 2, so we're going to take the first two from it and then the third one and fourth one from the piece below
    '   gl_Position = vec4(vertPosition, 0.0, 1.0);', //here all I'm going to do is say that the position equals vector 4 because GL position is a four dimensional vector
    // Alpha is ALWAYS 1.0
    '}'
  ].join('\n'); //this is I have an array, and inside the array I'm going to put the lines of the vertex shader each on their own actual line on the file 



let fragmentShaderText =
  [
    'precision mediump float;',
    '',
    'varying vec3 fragColor;',
    'void main()', //this one isn't taking in any additional parameters right now, I just want to color it
    '{',
    '  gl_FragColor = vec4(fragColor, 1.0);', //this is just going to say the fragment color is going to be one on the red, so completely filled with red, no green, no blue, full on the alpha because it's not transparent.
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



  // Now I need to set the information that the graphics card is going to be using
  // So back to the triangle, it has three points and each point is going to have an x and y position. We're not dealing with color right now, so that's just two points of data, and we know that from the fragment shader. We have one attribute, and that attribute is a vector two. 
  // So we need to create a list of those x and y positions that's going to define our triangle. After that we need to attach that list to the graphics card, or to the vertex shader
  let triangleVertices =
    [ //x and y   R, G, B
      0.0, 0.5, 1.5, 1.3, 0.6, // first is right in the middle on the x-axis, and it's going to be 3/4 of the way up the screen on the y-axis

      -0.5, -0.5, 0.7, 0.3, 1.0, // next, we're going left to make sure that we keep going w/ the counterclockwise order

      0.5, -0.5, 0.1, 1.0, 0.8
    ];

  // So this --^  right now is sitting on our main computer ramps, so it's sitting on our CPU accessible memory. The graphics card has no notion of what that is, the vertex shader has no notion.
  // What you use for graphics card programs is Buffers. What that is, is just a chunk of memory that's allocated for some purpose
  let triangleVertexBufferObject = gl.createBuffer(); // now this is a chunk of memory on the GPU that we're ready to use
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject); // What this line is saying is that the active buffer, we're using it as an array buffer, which you can think of that as just being variables that we're passing to the graphics card. Nothing too special, just vertex buffers do that.
  // Also we are binding the buffer that we just created to be the active buffer 

  // After that we want to specify the data on the active buffer
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW); // now what these three parameters mean is that this is the type of buffer we're talking about, an Array Buffer (notice that this actual variable is not called in the gl dot buffer data: reason being, it's going to use whatever active buffer is there, so whichever one that we last bound)
  // In the second parameter we're specifying that we want to use the points listed in triangleVertices (it would be fine as just triangleVertices without the Float 32 Array in languages like C and C++). The way JS stores things is everything is a 64-bit floating-point precision number, but OpenGL is expecting it in 32-bits, so we need to add a wonderful object called the float 32 array, which specifies the type and makes sure that it's correct for the OpenGL calls
  // Then the third parameter (gl.STATIC_DRAW) just means we're sending the info from the CPU memory to the GPU memory once, and that we're not going to change it ever again. It's just going over then we're done with it.



  // So now that we've sent the information over to the graphics card we now need to inform the vertex shader the vertPosition is the vertexes in triangleVertices, or rather every pair of the vertexes, because right now all it's doing is sitting there as six points, (0.0, 0.5), (-0.5, -0.5), and (0.5, -0.5), but there's no rhyme or reason to that.
  // The way we do this is we need to get a handle to that attribute
  var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition'); //we specify 2 parameters here, which program we're using, and the program will then specify which vertex shader we're using, and then what the name of the attribute that we're using is, and that's just vertPosition

  var colorAttribLocation = gl.getAttribLocation(program, 'vertColor'); //We don't have to do anything for the varying with this because by the time we get to the varying properties we're already done with the vertex shader. We only have to specify the inputs to the vertex shader because the inputs to the fragment shader, the CPU, isn't involved at all.



  // Now to specify the layout of that attribute
  gl.vertexAttribPointer(
    positionAttribLocation, // Attribute location
    2, // Number of elements in each attribute (this one's a vec2, so 2)
    gl.FLOAT, // Type of each of those
    gl.FALSE, // Whether or not the data is normalized
    5 * Float32Array.BYTES_PER_ELEMENT, // Size on an individual vertex
    0 // Offset from the beginning of a single vertex to this attribute
  );

  gl.vertexAttribPointer(
    colorAttribLocation,
    3,
    gl.FLOAT,
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT,
    2 * Float32Array.BYTES_PER_ELEMENT
  );



  gl.enableVertexAttribArray(positionAttribLocation); // enables the attribute for use
  gl.enableVertexAttribArray(colorAttribLocation);



  // Main render loop goes here
  // In a game this would be maybe a while loop where you write something like an updateWorld(), renderWorld() function or something like that
  // The more JavaScript way to do it would be something like...
  /*
    let loop = function(){
      updateWorld();
      renderWorld();
      if(running){
        requestAnimationFrame(loop);
      }
    }
    requestAnimationFrame(loop);
  */

  // That would be the more JS-like way of doing things. For this we're just going to draw the triangle out to the screen because we're not doing any actual animation

  // So first we need to specify which program we want to use
  gl.useProgram(program); // Since this is the only one we have so far it's the only one that really makes sense

  gl.drawArrays(gl.TRIANGLES, 0, 3); // This function will take three parameters, and this is going to use whichever buffer happens to be actively bound
  // The first parameter is going to say we're going to draw in triangles. 99% of the time you draw something it's going to be GL dot triangles. The other options are like GL dot points, lines, line segments, triangle fans, etc. And those do individual things that I'm not going to make note of here.
  // The second parameter is how many of these vertexes we're going to skip. In this case I want to skip zero
  // The third one is how many vertices we want to have to actually draw, which is three. We're drawing three to form a complete triangle. If we add more points in triangleVertices, for example if we wanted to draw it twice, putting in three more points, we would have to change the number of vertices we want to draw to 6
};



