const path = require('path');

module.exports = {
	style: {
		sass: {
			loaderOptions: {
				sassOptions: {
					outputStyle: 'expanded',
					quietDeps: true
				}
			}
		}
	},
	webpack: {
		configure: (webpackConfig) => {
			// Примусове підключення sass-loader
			webpackConfig.module.rules.forEach((rule) => {
				if (rule.oneOf) {
					rule.oneOf.forEach((loader) => {
						if (loader.use && Array.isArray(loader.use)) {
							loader.use.forEach((u) => {
								if (
									typeof u.loader === 'string' &&
									u.loader.includes('sass-loader')
								) {
									u.loader = require.resolve('sass-loader');
								}
							});
						}
					});
				}
			});

			// Додай цю частину: підтримка .html?raw
			webpackConfig.module.rules.push({
				test: /\.html$/,
				resourceQuery: /raw/, // дозволяє ?raw
				type: 'asset/source'
			});

			// Ігнорування warning
			webpackConfig.ignoreWarnings = [
				{ message: /legacy JS API is deprecated/ }
			];

			return webpackConfig;
		},
		alias: {
			'@components': path.resolve(__dirname, 'src/app/components'),
			'@section': path.resolve(__dirname, 'src/app/components/section'),
			'@analytics': path.resolve(__dirname, 'src/app/components/analytics'),
			'@pages': path.resolve(__dirname, 'src/app/pages'),
			'@form': path.resolve(__dirname, 'src/app/components/form'),
			'@hooks': path.resolve(__dirname, 'src/app/hooks'),
			'@styles': path.resolve(__dirname, 'src/css'),
			'@fonts': path.resolve(__dirname, 'src/fonts'),
			'@img': path.resolve(__dirname, 'public/img'),
			'@store': path.resolve(__dirname, 'src/store'),
			'@utils': path.resolve(__dirname, 'src/utils'),
		}
	}
};