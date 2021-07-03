Note: the OrbitControls are straight up copied from "three/examples/jsm/controls".

Here's why:
- It seems like they can't really be imported when using Next.js without doing a lot of extra work: https://discourse.threejs.org/t/how-to-load-orbitcontrols-in-a-nextjs-page/23321/2 
- This makes is easier to adjust them if that's necessary at some point
- Judging by the name of the folder these files were in ("examples"), I'm not entirely sure if they are even meant to be imported. 