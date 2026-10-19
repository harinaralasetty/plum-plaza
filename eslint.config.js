import tseslint from 'typescript-eslint';
export default tseslint.config({ignores:['dist/**','node_modules/**','test-results/**','playwright-report/**','review-purble-place-*/**']}, ...tseslint.configs.recommended);
