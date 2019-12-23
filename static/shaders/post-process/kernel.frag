#version 300 es
precision highp float;

in vec2 v_screencoord;

out vec4 color;

uniform sampler2D color_sampler;

const int WINDOW = 5; // The window size will be (2*WINDOW+1) x (2*WINDOW+1)

void main(){
    float sigma = 16.0;

      vec2 offsets[9] = vec2[](
        vec2(-1.0,  1.0), // top-left
        vec2( 0.0f,    1.0), // top-center
        vec2( 1.0,  1.0), // top-right
        vec2(-1.0,  0.0f),   // center-left
        vec2( 0.0f,    0.0f),   // center-center
        vec2( 1.0,  0.0f),   // center-right
        vec2(-1.0, -1.0), // bottom-left
        vec2( 0.0f,   -1.0), // bottom-center
        vec2( 1.0, -1.0)  // bottom-right    
    );


    ivec2 size = textureSize(color_sampler, 0); // This will give us the size of a mip level of the texture
    vec2 texelSize = 1.0/vec2(size); // 1/size = the change in texture coordinates between a pixel and its neighbors 
    float kernel[9] = float[](
        1.0, 1.0, 1.0,
        1.0,  -9.0, 1.0,
        1.0, 1.0, 1.0
    );
    float total_weight = 0.0;
    color = vec4(0);
    // We loop over every pixel in the window and calculate a weighted sum
    for(int i = 0; i < 9; i++){
         float weight = kernel[i];
         color += texture(color_sampler, v_screencoord + offsets[i]*texelSize) * weight;
        total_weight+=weight;
    }
    color /= total_weight; // We divide by the total weight to normalize the sum
}