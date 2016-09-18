fis.set('project.fileType.text', 'etpl');

fis.set('project.ignore', [
    '**.log',
    '**/*.swp'
]);

fis.set('project.files', [
    'lib/**',
    'src/**',
    'examples/**',
    'test/**'
]);

fis.config.set("project.watch.usePolling", true);

fis.match('*', {
    release: false
});

fis.match('main.js', {
    useHash: true,
    optimizer: fis.plugin('uglify-js', {
        output : {
            max_line_len : 500
        }
    }),
    release: '/src/main.js'
});

fis.match('/src/(**).js', {
    moduleId: '$1'
});

fis.match('/lib/(**).js', {
    moduleId: '$1',
    release: '/lib/$1'
});

fis.match('/examples/(**)', {
    release: '/examples/$1'
});

fis.hook('amd', {
    baseUrl: '/base'
});
