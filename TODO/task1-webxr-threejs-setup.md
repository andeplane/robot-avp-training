# Task 1: WebXR + Three.js Project Setup

## Summary

Initialize the Three.js + WebXR project with TypeScript, Vite, and Biome. Get a basic immersive-ar scene running in Apple Vision Pro's Safari browser.

## Acceptance Criteria

- [ ] Vite project initialized with TypeScript
- [ ] Biome configured for linting and formatting
- [ ] Three.js installed and rendering a basic scene
- [ ] WebXR immersive-ar session starts with `hand-tracking` feature requested
- [ ] Basic scene visible: ground plane, ambient + directional lighting
- [ ] Works in Safari on Apple Vision Pro (or WebXR emulator for dev)

## Technical Details

### Project Setup
- **Bundler**: Vite with TypeScript
- **Linter/Formatter**: Biome
- **3D Engine**: Three.js (latest)
- **Target**: Safari WebXR on Apple Vision Pro

### WebXR Session
```typescript
const session = await navigator.xr.requestSession('immersive-ar', {
  requiredFeatures: ['hand-tracking'],
  optionalFeatures: ['local-floor', 'bounded-floor']
});
renderer.xr.setSession(session);
```

### Scene Basics
- Ground plane (grid or subtle surface)
- Ambient light + directional light for visibility
- Camera configured via WebXR (no manual camera control in AR)

### Dev Tooling
- `biome.json` with recommended rules
- `tsconfig.json` with strict mode
- `vite.config.ts` with HTTPS (required for WebXR)
- Dev server needs HTTPS — use `@vitejs/plugin-basic-ssl` or `vite-plugin-mkcert`

## References

- [Three.js WebXR docs](https://threejs.org/docs/#manual/en/introduction/How-to-create-VR-content)
- [WebXR Hand Input](https://www.w3.org/TR/webxr-hand-input-1/)
- [Apple Vision Pro WebXR support](https://developer.apple.com/documentation/safari-release-notes)
