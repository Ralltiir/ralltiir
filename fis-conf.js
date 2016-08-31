fis.set('project.fileType.text', 'etpl');

fis.set('project.ignore', [
    '**.log',
    '**/*.swp'
]);

fis.set('project.files', [
    'lib/**',
    'src/**',
    'test/**'
]);

fis.match('src/(**).js', {
    isMod: true,
    moduleId: '$1'
});

fis.hook('amd', {
    baseUrl: '/base'
});
