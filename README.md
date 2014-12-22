WebGL CT
========

A system for simulating xray exposures and reconstructing into an image. The end goal is to be able to input slices reconstruct them, and view output with [this](http://www.lebarba.com/WebGL/Index.html).

Simulation of exposure
----------------------
Given an input image `IN` and the constants `a`,`b` and `c`,the program makes an image `OUT`. The constants `a`,`b` and `c` define the position of the source and detector; the focal point of the source is `(0,a)` and the detector is a line from `(-b,-c)` to `(b,-c)`.

<img src="http://gh.landersbenjamin.com/webgl-ct/input.svg" width="400" height="400">

The value`OUT[x][y]` is `∫IN[f(t)][g(t)]dt` such that `f(t)` and `g(t)` represent the line from the source to the point on the detector with the object rotated by a factor of `y`;

<img src="http://gh.landersbenjamin.com/webgl-ct/output.svg" width="400" height="400">

Psuedocode Here.

Reconstruction
--------------
Given the image `C` and a point `B`, the program reproduces image `A`. (All variables remain named the same)

Psuedocode Here.
