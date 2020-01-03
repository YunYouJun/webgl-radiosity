// parse model
function parseModelJson(jsonFile) {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", jsonFile, true);
  xhr.overrideMimeType("application/json");
  xhr.send();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      // get response
      if (xhr.status == 200) {
        object = JSON.parse(xhr.responseText);
        divideCornellBoxFaces(object, subdivisions);
        console.log(
          "Vertex num is " + object.meshes[0].vertexPositions.length + "."
        );
      } else {
        console.log("Fail:", xhr.status);
      }
    }
  };
}
// subdivide
function divideCornellBoxFaces(modelData, nDivs) {
  let meshes = modelData.meshes;
  for (let meshId = 0; meshId < meshes.length; meshId++) {
    let meshVpositions = meshes[meshId].vertexPositions;
    let nVertices = meshVpositions.length / 3;
    let meshVnormals = meshes[meshId].vertexNormals;
    let meshIndices = meshes[meshId].indices;
    let newMeshVpositions = [];
    let newMeshVnormals = [];
    let newMeshIndices = [];
    // take each quad and subdivide into n*m quads
    var meshIndex = 0;
    for (var i = 0; i < nVertices; i += 4) {
      var quad = new Array(4);
      for (var j = 0; j < 4; j++) {
        quad[j] = [
          meshVpositions[(i + j) * 3 + 0],
          meshVpositions[(i + j) * 3 + 1],
          meshVpositions[(i + j) * 3 + 2]
        ];
      }
      // assumes same normal for all vertices of the quad
      var normal = [
        meshVnormals[i * 3 + 0],
        meshVnormals[i * 3 + 1],
        meshVnormals[i * 3 + 2]
      ];
      // create vertex grid
      var vertexGrid = new Array(nDivs + 1); //rows
      for (var m = 0; m <= nDivs; m++) vertexGrid[m] = new Array(nDivs + 1);
      // create the first row of the vertex grid.
      // and create the last row of the vertex grid.
      var dHoriz1 = [
        (quad[1][0] - quad[0][0]) / nDivs,
        (quad[1][1] - quad[0][1]) / nDivs,
        (quad[1][2] - quad[0][2]) / nDivs
      ];
      var dHoriz2 = [
        (quad[2][0] - quad[3][0]) / nDivs,
        (quad[2][1] - quad[3][1]) / nDivs,
        (quad[2][2] - quad[3][2]) / nDivs
      ];
      for (var n = 0; n <= nDivs; n++) {
        vertexGrid[0][n] = [
          quad[0][0] + n * dHoriz1[0],
          quad[0][1] + n * dHoriz1[1],
          quad[0][2] + n * dHoriz1[2]
        ];
        vertexGrid[nDivs][n] = [
          quad[3][0] + n * dHoriz2[0],
          quad[3][1] + n * dHoriz2[1],
          quad[3][2] + n * dHoriz2[2]
        ];
        // create intermediate rows for the vertex grid.
        var dVert = [
          (vertexGrid[nDivs][n][0] - vertexGrid[0][n][0]) / nDivs,
          (vertexGrid[nDivs][n][1] - vertexGrid[0][n][1]) / nDivs,
          (vertexGrid[nDivs][n][2] - vertexGrid[0][n][2]) / nDivs
        ];
        for (var m = 1; m < nDivs; m++) {
          vertexGrid[m][n] = [
            vertexGrid[0][n][0] + m * dVert[0],
            vertexGrid[0][n][1] + m * dVert[1],
            vertexGrid[0][n][2] + m * dVert[2]
          ];
        }
      }
      // create new mesh positions, normals, indices from the grid
      for (var m = 0; m < nDivs; m++) {
        // vertical subdivisions
        for (var n = 0; n < nDivs; n++) {
          newMeshIndices.push(meshIndex + (m + 1) * (nDivs + 1) + n);
          newMeshIndices.push(meshIndex + m * (nDivs + 1) + n);
          newMeshIndices.push(meshIndex + m * (nDivs + 1) + n + 1);
          newMeshIndices.push(meshIndex + m * (nDivs + 1) + n + 1);
          newMeshIndices.push(meshIndex + (m + 1) * (nDivs + 1) + n + 1);
          newMeshIndices.push(meshIndex + (m + 1) * (nDivs + 1) + n);
        }
      }
      for (var m = 0; m <= nDivs; m++) {
        // vertical subdivisions
        for (var n = 0; n <= nDivs; n++, meshIndex++) {
          // horizontal subdivisions
          var k;
          for (k = 0; k < 3; k++) newMeshVpositions.push(vertexGrid[m][n][k]);
          for (k = 0; k < 3; k++) newMeshVnormals.push(normal[k]);
        }
      }
    }
    meshes[meshId].vertexPositions = newMeshVpositions;
    meshes[meshId].vertexNormals = newMeshVnormals;
    meshes[meshId].indices = newMeshIndices;
  }
}
