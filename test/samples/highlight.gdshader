shader_type spatial;
render_mode unshaded, cull_disabled, blend_add, depth_draw_never, shadows_disabled;

// A soft glowing rounded rectangle laid on the asphalt under a vehicle.
uniform vec4 color : source_color = vec4(0.35, 0.8, 1.0, 1.0);
uniform float strength = 1.0;
uniform vec2 size = vec2(2.0, 5.0);  // footprint in meters, matches the quad scale
uniform float time_scale = 3.0;

void fragment() {
    vec2 p = (UV - 0.5) * size;
    vec2 half_size = size * 0.5 - vec2(0.35);
    vec2 q = abs(p) - half_size;
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 0.2;
    float edge = smoothstep(0.32, 0.0, abs(d)) ;
    float fill = smoothstep(0.1, -0.4, d) * 0.18;
    float wave = 0.75 + 0.25 * sin(TIME * time_scale);
    ALBEDO = color.rgb * (edge + fill) * strength * wave;
}
