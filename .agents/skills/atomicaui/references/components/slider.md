# Slider

A value or range chosen along a horizontal or vertical track, by pointer or keyboard. Release 7.0.9. Source: `src/vendor/atomic-aui/lib/slider/`.

## Use / do not use
| Need | Use |
|---|---|
| One value or a range along a track | `Slider` |
| Exact typed number with steppers | `NumberField` |
| On/off | `Switch` |

## One value
```tsx
<Slider aria-label="Volume" value={volume} onValueChange={setVolume} min={0} max={100} step={5} />
```
With no children the part draws one thumb, track and indicator. Give it an accessible name. `min`, `max` and `step` come from the product rules, not from a screenshot or a guessed default.

## A range
```tsx
<Slider value={priceRange} onValueChange={setPriceRange} min={0} max={1000} step={10}>
  <Slider.Control>
    <Slider.Track>
      <Slider.Indicator />
      <Slider.Thumb aria-label="Minimum price" />
      <Slider.Thumb aria-label="Maximum price" />
    </Slider.Track>
    <Slider.Ticks count={6} />
  </Slider.Control>
</Slider>
```
Write one `Slider.Thumb` per range value and name each thumb for its job. `Slider.Ticks` is optional and goes inside `Slider.Control`, after the track; use `values` for specific marks or `count` for evenly spaced marks. The library also has `Slider.Label` and `Slider.Value` for a composed field.

## Rules and checks
- `orientation="vertical"` is for a vertical control specified by the source; the default is horizontal. Give a vertical slider enough space in its layout without writing a custom drag handler.
- Verify pointer dragging, arrow keys, Home/End and the relevant step keys for every thumb. Check that values stay within `min` and `max` and follow `step`.
- Check the thumb names, value announcements, disabled state and focus in light and dark. For a range, focus each thumb separately.

More: `src/vendor/atomic-aui/lib/slider/slider.tsx`.
