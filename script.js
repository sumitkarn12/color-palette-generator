const imageUpload = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');
const imagePreviewContainer = document.getElementById('image-preview-container');
const colorPaletteBox = document.getElementById('color-palette-box');
const resultSection = document.getElementById('result-section');

function showToast( m, d = 5 ) {
  Toastify({
    text: m,
    duration: d * 1000,
  }).showToast();
}

imagePreview.onload = () => analyzeImage();

function loadImage( imageFile ) {
  if (imageFile && imageFile.type.startsWith("image") ) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.src = e.target.result;
      imagePreview.style.display = 'block';
      imagePreviewContainer.classList.remove( "drop-message" );
    };
    reader.readAsDataURL(imageFile);
  } else if ( !imageFile.type.startsWith("image") ) {
    showToast('Unsupported file selected.');
    imagePreview.style.display = 'none';
    resultSection.style.display = 'none';
    imagePreviewContainer.classList.add("drop-message");
  } else {
    showToast('Please select an image file.');
    imagePreview.style.display = 'none';
    resultSection.style.display = 'none';
    imagePreviewContainer.classList.add("drop-message");
  }
}

imageUpload.addEventListener('change', (event) => loadImage(event.target.files[0] ) );

const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
  const hex = x.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}).join('')

function analyzeImage() {
  try {
    const colorThief = new ColorThief();
    let colorPalette = colorThief.getPalette(imagePreview, 5);
    colorPalette = colorPalette.map(a => rgbToHex(a[0], a[1], a[2]));

    colorPaletteBox.innerHTML = "";

    colorPalette.forEach((c, i) => {
      const div = document.createElement("div");
      div.classList.add("color-swatch-box", "center");
      div.style.backgroundColor = c;

      if (i == 0) {
        div.classList.add("primary-color");
      }

      const t = document.createElement("p");
      t.textContent = c;
      div.appendChild(t);
      colorPaletteBox.appendChild(div);
      div.addEventListener("click", e => {
        e.preventDefault();
        navigator.clipboard.writeText( e.target.textContent );
        showToast( "Color copied to clipboard." );
      })
    });

    resultSection.style.display = 'block';
    showToast('Analysis complete!');
  } catch (error) {
    console.error('Error analyzing image:', error);
    showToast('An error occurred during analysis. Please try a different image.');
  }
}

// Utility function to prevent default browser behavior
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Preventing default browser behavior when dragging a file over the container
imagePreviewContainer.addEventListener('dragenter', preventDefaults);
imagePreviewContainer.addEventListener('dragover', ( e ) => {
  preventDefaults( e );
  imagePreviewContainer.classList.add('drag-over');
});
imagePreviewContainer.addEventListener('dragleave', ( e ) => {
  preventDefaults(e);
  imagePreviewContainer.classList.remove('drag-over');
});
// Handling dropping files into the area
imagePreviewContainer.addEventListener('drop', (e) => {
  e.preventDefault();
  imagePreviewContainer.classList.remove('drag-over');
  loadImage(e.dataTransfer.files[0]);
});
