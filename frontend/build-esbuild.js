const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

async function build() {
  try {
    // Copy HTML file
    if (!fs.existsSync('dist')) {
      fs.mkdirSync('dist', { recursive: true });
    }
    
    // Read and modify HTML template
    let html = fs.readFileSync('index.html', 'utf8');
    html = html.replace(
      '<script type="module" src="/src/main.jsx"></script>',
      '<script src="/assets/main.js"></script>'
    );
    
    fs.writeFileSync('dist/index.html', html);
    
    // Copy CSS files
    const srcDir = 'src';
    const copyCSS = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const srcPath = path.join(dir, item);
        const stat = fs.statSync(srcPath);
        
        if (stat.isDirectory()) {
          copyCSS(srcPath);
        } else if (item.endsWith('.css')) {
          const distDir = path.dirname(srcPath.replace('src', 'dist/assets'));
          if (!fs.existsSync(distDir)) {
            fs.mkdirSync(distDir, { recursive: true });
          }
          fs.copyFileSync(srcPath, path.join(distDir, item));
        }
      }
    };
    
    copyCSS(srcDir);
    
    // Build with esbuild
    await esbuild.build({
      entryPoints: ['src/main.jsx'],
      bundle: true,
      outfile: 'dist/assets/main.js',
      minify: true,
      target: 'es2015',
      format: 'iife',
      define: {
        'process.env.NODE_ENV': '"production"',
        'import.meta.env.VITE_API_URL': '"https://your-backend-url.vercel.app"'
      },
      external: [],
      loader: {
        '.jsx': 'jsx',
        '.js': 'jsx',
        '.css': 'css',
        '.png': 'file',
        '.jpg': 'file',
        '.svg': 'file'
      },
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment'
    });
    
    console.log('✅ esbuild completed successfully!');
  } catch (error) {
    console.error('❌ esbuild failed:', error);
    process.exit(1);
  }
}

build();
