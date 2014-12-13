WebGL CT
========

A system for simulating xray exposures and reconstructing into an image. The end goal is to be able to input slices reconstruct them, and view output with [this](http://www.lebarba.com/WebGL/Index.html).

Simulation of exposure
----------------------
Given an input image `A` and a point `B`,the program makes an image `C` such that the pixel `C[x][y]` is the value a detector's xth pixel would read if a x-ray source were to be placed at `B` and the `A` were to be rotated `2pi*y/MAXY` radians.

Psuedocode Here.

Reconstruction
--------------
Given the image `C` and a point `B`, the program reproduces image `A`. (All variables remain named the same)

Psuedocode Here.
