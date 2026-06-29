const filterToggle = document.getElementById("filterToggle");
const filterModal = document.getElementById("filterModal");
const closeFilter = document.getElementById("closeFilter");

filterToggle?.addEventListener("click", () => { filterModal.classList.remove("hidden"); });
closeFilter?.addEventListener("click", () => { filterModal.classList.add("hidden"); });
filterModal?.addEventListener("click", (e) => { if (e.target === filterModal) filterModal.classList.add("hidden"); });

const rangeMin = document.getElementById("rangeMin");
const rangeMax = document.getElementById("rangeMax");
const minPrice = document.getElementById("minPrice");
const maxPrice = document.getElementById("maxPrice");
const sliderTrack = document.getElementById("sliderTrack");
const minGap = 1;
const sliderMax = parseInt(rangeMax.max);

function updateTrack() {
  const percent1 = (rangeMin.value / sliderMax) * 100;
  const percent2 = (rangeMax.value / sliderMax) * 100;
  sliderTrack.style.background = `linear-gradient(to right, #d1d5db ${percent1}%, #3b82f6 ${percent1}%, #3b82f6 ${percent2}%, #d1d5db ${percent2}%)`;
}
function syncSliders(e) {
  if (parseInt(rangeMax.value) - parseInt(rangeMin.value) <= minGap) {
    if (e.target === rangeMin) rangeMin.value = parseInt(rangeMax.value) - minGap;
    else rangeMax.value = parseInt(rangeMin.value) + minGap;
  }
  minPrice.value = rangeMin.value;
  maxPrice.value = rangeMax.value;
  updateTrack();
}


rangeMin.addEventListener("input", syncSliders);
rangeMax.addEventListener("input", syncSliders);
minPrice.addEventListener("input", () => { if (+minPrice.value < +rangeMax.value - minGap) { rangeMin.value = minPrice.value; updateTrack(); } });
maxPrice.addEventListener("input", () => { if (+maxPrice.value > +rangeMin.value + minGap) { rangeMax.value = maxPrice.value; updateTrack(); } });
updateTrack();

document.getElementById("sort").addEventListener("change", () => { document.getElementById("sortForm").submit(); });
