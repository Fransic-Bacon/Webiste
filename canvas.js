 const canvas = document.getElementById('canvas');
        const gl = canvas.getContext('webgl');
        
        if (!gl) {
            console.error('WebGL not supported');
        }
        
        // Responsive canvas sizing
        function resizeCanvas() {
            const displayWidth = window.innerWidth;
            const displayHeight = window.innerHeight;
            
            if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
                canvas.width = displayWidth;
                canvas.height = displayHeight;
                gl.viewport(0, 0, canvas.width, canvas.height);
            }
        }
        
        // Initial resize
        resizeCanvas();
        
        // Vertex shader source
        const vertexShaderSource = `
            attribute vec2 a_position;
            uniform vec2 u_resolution;
            uniform vec2 u_translation;
            uniform vec2 u_scale;
            uniform float u_rotation;
            
            void main() {
                // Apply transformations
                vec2 scaledPosition = a_position * u_scale;
                
                // Apply rotation
                float cosR = cos(u_rotation);
                float sinR = sin(u_rotation);
                vec2 rotatedPosition = vec2(
                    scaledPosition.x * cosR - scaledPosition.y * sinR,
                    scaledPosition.x * sinR + scaledPosition.y * cosR
                );
                
                vec2 position = rotatedPosition + u_translation;
                
                // Convert from pixels to clip space
                vec2 zeroToOne = position / u_resolution;
                vec2 zeroToTwo = zeroToOne * 2.0;
                vec2 clipSpace = zeroToTwo - 1.0;
                
                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
            }
        `;
        
        // Fragment shader source
        const fragmentShaderSource = `
            precision mediump float;
            uniform vec4 u_color;
            
            void main() {
                gl_FragColor = u_color;
            }
        `;
        
        // Create shader function
        function createShader(gl, type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            
            return shader;
        }
        
        // Create program function
        function createProgram(gl, vertexShader, fragmentShader) {
            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error('Error linking program:', gl.getProgramInfoLog(program));
                gl.deleteProgram(program);
                return null;
            }
            
            return program;
        }
        
        // Create shaders and program
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        const program = createProgram(gl, vertexShader, fragmentShader);
        
        // Get attribute and uniform locations
        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
        const translationUniformLocation = gl.getUniformLocation(program, 'u_translation');
        const scaleUniformLocation = gl.getUniformLocation(program, 'u_scale');
        const rotationUniformLocation = gl.getUniformLocation(program, 'u_rotation');
        const colorUniformLocation = gl.getUniformLocation(program, 'u_color');
        
        // Create rectangle geometry
        const positions = [
            0, 0,
            1, 0,
            0, 1,
            0, 1,
            1, 0,
            1, 1
        ];
        
        // Create buffer
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        
        // Shape class
        class Shape {
            constructor() {
                this.reset();
            }
            
            reset() {
                this.x = Math.random() * window.innerWidth;
                this.y = Math.random() * window.innerHeight;
                this.width = Math.random() * 40 + 15; // 15-55px for mobile
                this.height = Math.random() * 40 + 15; // 15-55px for mobile
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.02;
                this.vx = (Math.random() - 0.5) * 0.3; // Slower for mobile
                this.vy = (Math.random() - 0.5) * 0.3; // Slower for mobile
                this.opacity = Math.random() * 0.3 + 0.1; // 0.1-0.4 for subtlety
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.rotation += this.rotationSpeed;
                
                // Wrap around edges with current screen size
                const w = window.innerWidth;
                const h = window.innerHeight;
                
                if (this.x > w + this.width) this.x = -this.width;
                if (this.x < -this.width) this.x = w + this.width;
                if (this.y > h + this.height) this.y = -this.height;
                if (this.y < -this.height) this.y = h + this.height;
            }
            
            draw() {
                gl.uniform2f(translationUniformLocation, this.x, this.y);
                gl.uniform2f(scaleUniformLocation, this.width, this.height);
                gl.uniform1f(rotationUniformLocation, this.rotation);
                gl.uniform4f(colorUniformLocation, 0, 0, 0, this.opacity);
                
                gl.drawArrays(gl.TRIANGLES, 0, 6);
            }
        }
        
        // Create shapes
        let shapes = [];
        function createShapes() {
            shapes = [];
            // Fewer shapes on mobile for better performance
            const shapeCount = window.innerWidth < 768 ? 15 : 25;
            for (let i = 0; i < shapeCount; i++) {
                shapes.push(new Shape());
            }
        }
        createShapes();
        
        // Render function
        function render() {
            // Set viewport
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            
            // Clear canvas
            gl.clearColor(1, 1, 1, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            
            // Enable blending for transparency
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            
            // Use program
            gl.useProgram(program);
            
            // Bind position buffer
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
            
            // Set resolution
            gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
            
            // Update and draw shapes
            shapes.forEach(shape => {
                shape.update();
                shape.draw();
            });
            
            requestAnimationFrame(render);
        }
        
        // Handle window resize
        let resizeTimeout;
        function handleResize() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                resizeCanvas();
                createShapes(); // Recreate shapes for new screen size
            }, 100);
        }
        
        window.addEventListener('resize', handleResize);
        
        // Start rendering
        render();