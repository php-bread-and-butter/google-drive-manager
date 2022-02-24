const isDevelopment = process.env.NODE_ENV !== 'production'
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'development',
    entry: {
        'assets/js/gdmanager': path.resolve(__dirname, './src/index.js'),
    },
    devServer: {
        contentBase: './dist',
    },
    plugins: [
        new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            alwaysWriteToDisk: true,
            inject: false,
            conversion: 'assets/js/gdmanager.min.js',
            minify: {
                collapseWhitespace: true
            }
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
    ],
    output: {
        publicPath: '',
        filename: '[name].min.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        libraryTarget: 'umd',
        library: 'DriveManager',
    },
    module: {
        rules: [
            {
                test: /\.(scss)$/,
                use: [
                    {
                        loader: isDevelopment
                        ? 'style-loader'
                        : MiniCssExtractPlugin.loader // inject CSS to page
                    }, 
                    {
                        loader: 'css-loader', // translates CSS into CommonJS modules
                    }, 
                    {
                        loader: 'postcss-loader', // Run post css actions
                        options: {
                            postcssOptions: {
                                plugins: [
                                    [
                                        require('precss'),
                                        require('autoprefixer')
                                    ],
                                ],
                            },
                        },
                    }, 
                    {
                        loader: 'sass-loader' // compiles Sass to CSS
                    }
                ]
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                use: [
                    { 
                        loader: 'url-loader',
                        options: {
                            name: 'assets/img/[name].[ext]'
                        }
                    },
                ],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                use: [
                    { 
                        loader: 'url-loader',
                        options: {
                            name: 'assets/fonts/[name].[ext]'
                        }
                    },
                ],
            },
        ]
    }, 
    resolve: {
        alias: {
            Assets: path.resolve(__dirname, 'src/assets/'),
        },
        extensions: ['.js', '.jsx', '.scss']
    }  
};