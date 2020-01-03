function RenderableModel(gl, model) {
  function Drawable(attribLocations, vArrays, nVertices, indexArray, drawMode) {
    // Create a buffer object
    let vertexBuffers = [];
    let nElements = [];
    let nAttributes = attribLocations.length;

    let verts = [];
    let c = 0;
    for (let i = 0; i < indexArray.length; i++) {
      verts[c] = vArrays[0][indexArray[i] * 3];
      verts[c + 1] = vArrays[0][indexArray[i] * 3 + 1];
      verts[c + 2] = vArrays[0][indexArray[i] * 3 + 2];

      c += 3;
    }
    vArrays[0] = verts;

    for (let i = 0; i < nAttributes; i++) {
      if (vArrays[i]) {
        vertexBuffers[i] = gl.createBuffer();
        if (!vertexBuffers[i]) {
          //console.log('Failed to create the buffer object');
          return null;
        }
        // Bind the buffer object to an ARRAY_BUFFER target
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[i]);
        // Write date into the buffer object
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(vArrays[i]),
          gl.STATIC_DRAW
        );
        //console.log("varrays is " + vArrays[2].length);
        nElements[i] = vArrays[i].length / nVertices;
        nElements[1] = 3;
        nElements[0] = 3;
      } else {
        vertexBuffers[i] = null;
      }
    }

    let indexBuffer = null;
    if (indexArray) {
      indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indexArray),
        gl.STATIC_DRAW
      );
    }

    this.draw = function() {
      gl.useProgram(program);
      for (let i = 0; i < nAttributes; i++) {
        if (vertexBuffers[i]) {
          gl.enableVertexAttribArray(attribLocations[i]);
          // Bind the buffer object to target
          gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[i]);
          // Assign the buffer object to a_Position variable
          gl.vertexAttribPointer(
            attribLocations[i],
            nElements[i],
            gl.FLOAT,
            false,
            0,
            0
          );
        } else {
          gl.disableVertexAttribArray(attribLocations[i]);
          gl.vertexAttrib3f(attribLocations[i], 1, 1, 1);
          //console.log("Missing "+attribLocations[i]);
        }
      }
      gl.drawArrays(drawMode, 0, vArrays[0].length / 3);
    };
  }

  let VSHADER_SOURCE =
    "attribute vec3 position;\n" +
    "attribute vec3 color;\n" +
    //'attribute vec3 normal;\n' +
    //'uniform mat4 mvpT;'+
    "uniform mat4 modelT, viewT, projT;" +
    "varying vec3 fcolor, fpos;" +
    "void main() {\n" +
    //'  gl_Position = modelT*vec4(position,1.0);\n' +
    "	gl_Position = projT*viewT*modelT*vec4(position,1.0);\n" +
    "	fcolor = color;\n" +
    "	fpos = (modelT*vec4(position, 1.0)).xyz;" +
    "}\n";

  // Fragment shader program
  let FSHADER_SOURCE =
    "precision mediump float;" +
    "uniform float exposure;" +
    "varying vec3 fcolor, fpos;" +
    "void main() {\n" +
    "gl_FragColor = vec4(exposure*fcolor.x, exposure*fcolor.y, exposure*fcolor.z, 1.0);" +
    "}\n";

  let program = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
  if (!program) {
    alert("Failed to create program");
    return false;
  }
  gl.useProgram(program);
  //else console.log('Shader Program was successfully created.');
  let a_Position = gl.getAttribLocation(program, "position");
  let a_Color = gl.getAttribLocation(program, "color");

  let a_Locations = [a_Position, a_Color];

  // Get the location/address of the uniform variable inside the shader program.
  let mmLoc = gl.getUniformLocation(program, "modelT");
  let vmLoc = gl.getUniformLocation(program, "viewT");
  let pmLoc = gl.getUniformLocation(program, "projT");
  let exposureLoc = gl.getUniformLocation(program, "exposure");

  let drawables = [];
  let modelTransformations = [];
  let nDrawables = 0;
  let nNodes = model.nodes ? model.nodes.length : 1;
  let drawMode = model.drawMode ? gl[model.drawMode] : gl.TRIANGLES;

  for (let i = 0; i < nNodes; i++) {
    let nMeshes = model.nodes
      ? model.nodes[i].meshIndices.length
      : model.meshes.length;
    for (let j = 0; j < nMeshes; j++) {
      let index = model.nodes ? model.nodes[i].meshIndices[j] : j;
      let mesh = model.meshes[index];

      drawables[nDrawables] = new Drawable(
        a_Locations,
        [mesh.vertexPositions, mesh.vertexColors],
        mesh.vertexPositions.length / 3,
        mesh.indices,
        drawMode
      );

      let m = new Matrix4();
      if (model.nodes)
        m.elements = new Float32Array(model.nodes[i].modelMatrix);
      modelTransformations[nDrawables] = m;

      nDrawables++;
    }
  }
  // Get the location/address of the vertex attribute inside the shader program.
  this.draw = function(pMatrix, vMatrix, mMatrix) {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);
    gl.uniform1f(exposureLoc, exposure);

    gl.uniformMatrix4fv(pmLoc, false, pMatrix.elements);
    gl.uniformMatrix4fv(vmLoc, false, vMatrix.elements);

    for (let i = 0; i < nDrawables; i++) {
      gl.uniformMatrix4fv(
        mmLoc,
        false,
        mMatrix
          ? new Matrix4(mMatrix).multiply(modelTransformations[i]).elements
          : modelTransformations[i].elements
      );

      drawables[i].draw();
    }
  };
  this.getBounds = function() // Computes Model bounding box
  {
    let xmin, xmax, ymin, ymax, zmin, zmax;
    let firstvertex = true;
    let nNodes = model.nodes ? model.nodes.length : 1;
    for (let k = 0; k < nNodes; k++) {
      let m = new Matrix4();
      if (model.nodes)
        m.elements = new Float32Array(model.nodes[k].modelMatrix);
      //console.log(model.nodes[k].modelMatrix);
      let nMeshes = model.nodes
        ? model.nodes[k].meshIndices.length
        : model.meshes.length;
      for (let n = 0; n < nMeshes; n++) {
        let index = model.nodes ? model.nodes[k].meshIndices[n] : n;
        let mesh = model.meshes[index];
        for (let i = 0; i < mesh.vertexPositions.length; i += 3) {
          let vertex = m.multiplyVector4(
            new Vector4([
              mesh.vertexPositions[i],
              mesh.vertexPositions[i + 1],
              mesh.vertexPositions[i + 2],
              1
            ])
          ).elements;

          if (firstvertex) {
            xmin = xmax = vertex[0];
            ymin = ymax = vertex[1];
            zmin = zmax = vertex[2];
            firstvertex = false;
          } else {
            if (vertex[0] < xmin) xmin = vertex[0];
            else if (vertex[0] > xmax) xmax = vertex[0];
            if (vertex[1] < ymin) ymin = vertex[1];
            else if (vertex[1] > ymax) ymax = vertex[1];
            if (vertex[2] < zmin) zmin = vertex[2];
            else if (vertex[2] > zmax) zmax = vertex[2];
          }
        }
      }
    }
    let dim = {};
    dim.min = [xmin, ymin, zmin];
    dim.max = [xmax, ymax, zmax];
    //console.log(dim);
    return dim;
  };
}
