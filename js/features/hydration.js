const HydrationFeature = {
  presets: [250, 500],
  percentage(data) {
    return Utils.clamp(Math.round((data.current / data.target) * 100), 0, 100);
  },
};

window.HydrationFeature = HydrationFeature;
