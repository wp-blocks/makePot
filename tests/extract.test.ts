import { describe, expect } from '@jest/globals'
import { doTree } from '../src/parser/tree'

describe('getStrings', () => {
	it('should extract translations from js', () => {
		const content = `var foo = __('Hello World', 'greeting');`
		const filename = 'filename.js'

		const result = doTree(content, filename)

		expect(result).toMatchObject({
			'': {
				'Hello World': {
					comments: {
						reference: 'filename.js:1',
					},
					msgid: 'Hello World',
					msgstr: [''],
				},
			},
		})
	})
	it('should extract translations from ts', () => {
		const content = `__('Hello World', 'greeting');`
		const filename = 'filename.ts'

		const result = doTree(content, filename)

		expect(result).toMatchObject({
			'': {
				'Hello World': {
					comments: {
						reference: 'filename.ts:1',
					},
					msgid: 'Hello World',
					msgstr: [''],
				},
			},
		})
	})
	it('should extract translations from tsx', () => {
		const content = `const element = <h1>{ __('Hello World', 'greeting')}</h1>;`

		const filename = 'filename.tsx'

		const result = doTree(content, filename)

		expect(result).toMatchObject({
			'': {
				'Hello World': {
					comments: {
						reference: 'filename.tsx:1',
					},
					msgid: 'Hello World',
					msgstr: [''],
				},
			},
		})
	})
	it('should extract translations with context', () => {
		const content = `<?php __('Hello World', 'greeting'); ?>`
		const filename = 'filename.php'

		const result = doTree(content, filename)

		expect(result).toMatchObject({
			'': {
				'Hello World': {
					comments: {
						reference: 'filename.php:1',
						translator: '',
					},
					msgctxt: '',
					msgid: 'Hello World',
					msgid_plural: '',
					msgstr: [''],
				},
			},
		})
	})
	it('should extract translations from code content with no context or translator comments', () => {
		const content = `<?php _e('Hello World'); ?>`
		const expected = {
			'': {
				'Hello World': {
					comments: {
						reference: 'filename.php:1',
						translator: '',
					},
					msgctxt: '',
					msgid: 'Hello World',
					msgstr: [''],
					msgid_plural: '',
				},
			},
		}
		const filename = 'filename.php'

		const result = doTree(content, filename)

		expect(result).toEqual(expected)
	})

	it('should extract translations with comments', () => {
		const filename = 'filename.php'
		const content = `
		<?php /** translators: ciao! */ echo _x('Hello World', 'greeting'); ?>`
		const expected = {
			greeting: {
				'Hello World': {
					comments: {
						reference: 'filename.php:2',
						translator: 'ciao!',
					},
					msgctxt: 'greeting',
					msgid: 'Hello World',
					msgid_plural: '',
					msgstr: [''],
				},
			},
		}

		const result = doTree(content, filename)

		expect(result).toEqual(expected)
	})

	it('should extract translations with comments reporting the right position', () => {
		const filename = 'filename.php'
		const content = `



/** line 5*/




		<?php echo _x('Hello World', 'greeting'); ?>`
		const expected = {
			greeting: {
				'Hello World': {
					msgctxt: 'greeting',
					msgid: 'Hello World',
					msgid_plural: '',
					msgstr: [''],
					comments: {
						translator: '',
						reference: 'filename.php:10',
					},
				},
			},
		}

		const result = doTree(content, filename)

		expect(result).toMatchObject(expected)
	})

	it('should extract translations inside a sprint', () => {
		const filename = 'filename.php'
		const content = ` <?php
$url = 'http://example.com';
$link = sprintf( wp_kses( __( 'Check out this link to my <a href="%s">website</a> made with WordPress.', 'my-text-domain' ), array(  'a' => array( 'href' => array() ) ) ), esc_url( $url ) );
echo $link;`
		const expected = {
			'': {
				'Check out this link to my <a href="%s">website</a> made with WordPress.':
					{
						comments: {
							reference: 'filename.php:3',
						},
						msgid: 'Check out this link to my <a href="%s">website</a> made with WordPress.',
						msgstr: [''],
					},
			},
		}

		const result = doTree(content, filename)

		expect(result).toMatchObject(expected)
	})
})

describe('getStrings wp cli', () => {
	it('should extract from an array of translations', () => {
		const filename = 'filename.php'
		const content = `<?php $instructions = array(
		"Overview" => array(
				"title" => __( 'Overview', 'vsge-3d-product-viewer' ),
				"text"  => __( "Hold down the right button to move the model", 'vsge-3d-product-viewer' ),
				"icon"  => 'icon-book'
		),
		"Rotation" => array(
				"title" => __( 'Rotation', 'vsge-3d-product-viewer' ),
				"text"  => __( "Left-click and drag to change the angle", 'vsge-3d-product-viewer' ),
				"icon"  => 'icon-rotation'
		),
		"Zoom"     => array(
				"title" => __( 'Zoom', 'vsge-3d-product-viewer' ),
				"text"  => __( "Use the mouse wheel to zoom in or out on the model", 'vsge-3d-product-viewer' ),
				"icon"  => 'icon-zoom'
		)
);
`

		const result = doTree(content, filename)
		expect(result).toMatchSnapshot()
	})

	it('should extract translations with translator comments inside the formatting hell', () => {
		const filename = 'filename.php'
		const content = `<?php if ( count( $errors_in_remigrate_batch ) > 0 ) {
		$formatted_errors = wp_json_encode( $errors_in_remigrate_batch, JSON_PRETTY_PRINT );
		WP_CLI::warning(
		  sprintf(
		    /* Translators: %1$d is number of errors and %2$s is the formatted array of order IDs. */
		      _n(
		        '%1$d error found: %2$s when re-migrating order. Please review the error above.',
		        '%1$d errors found: %2$s when re-migrating orders. Please review the errors above.',
		     	count( %s ),
		        'woocommerce'
		      ),
		    count( $errors_in_remigrate_batch ),
		    $formatted_errors
		    )
		  );
		} else {
			WP_CLI::warning( 'Re-migration successful.', 'woocommerce' );
		}
`
		const expected = {
			'': {
				'%1$d error found: %2$s when re-migrating order. Please review the error above.':
					{
						comments: {
							reference: 'filename.php:6',
							translator:
								'%1$d is number of errors and %2$s is the formatted array of order IDs.',
						},
						msgctxt: '',
						msgid: '%1$d error found: %2$s when re-migrating order. Please review the error above.',
						msgid_plural:
							'%1$d errors found: %2$s when re-migrating orders. Please review the errors above.',
						msgstr: ['', ''],
					},
			},
		}

		const result = doTree(content, filename)
		expect(expected).toMatchObject(result)
	})

	/** see https://github.com/wp-cli/i18n-command/blob/main/features/makepot.feature */
	it('should extract translations and comments from code content', () => {
		const content = `<?php

    And a foo-plugin/foo-plugin.php file:
      """
      <?php
      /**
       */
       __( 'Hello World', 'foo-plugin' );
      """
    And a foo-plugin/vendor/ignored.php file:
      """
      <?php
       __( 'I am being ignored', 'foo-plugin' );
      """
      __( '__', 'foo-plugin' );
      esc_attr__( 'esc_attr__', 'foo-plugin' );
      esc_html__( 'esc_html__', 'foo-plugin' );
      esc_xml__( 'esc_xml__', 'foo-plugin' );
      _e( '_e', 'foo-plugin' );
      esc_attr_e( 'esc_attr_e', 'foo-plugin' );
      esc_html_e( 'esc_html_e', 'foo-plugin' );
      esc_xml_e( 'esc_xml_e', 'foo-plugin' );
      _x( '_x', '_x_context', 'foo-plugin' );
      _ex( '_ex', '_ex_context', 'foo-plugin' );
      esc_attr_x( 'esc_attr_x', 'esc_attr_x_context', 'foo-plugin' );
      esc_html_x( 'esc_html_x', 'esc_html_x_context', 'foo-plugin' );
      esc_xml_x( 'esc_xml_x', 'esc_xml_x_context', 'foo-plugin' );
      _n( '_n_single', '_n_plural', $number, 'foo-plugin' );
      _nx( '_nx_single', '_nx_plural', $number, '_nx_context', 'foo-plugin' );
      _n_noop( '_n_noop_single', '_n_noop_plural', 'foo-plugin' );
      _nx_noop( '_nx_noop_single', '_nx_noop_plural', '_nx_noop_context', 'foo-plugin' );

      // Compat.
      _( '_', 'foo-plugin' );

      // Deprecated.
      _c( '_c', 'foo-plugin' );
      _nc( '_nc_single', '_nc_plural', $number, 'foo-plugin' );
      __ngettext( '__ngettext_single', '__ngettext_plural', $number, 'foo-plugin' );
      __ngettext_noop( '__ngettext_noop_single', '__ngettext_noop_plural', 'foo-plugin' );

      __unsupported_func( '__unsupported_func', 'foo-plugin' );
      __( 'wrong-domain', 'wrong-domain' );

      // See https://github.com/wp-cli/i18n-command/issues/344
      \\__( '\\__', 'foo-plugin' );
      \\_e( '\\_e', 'foo-plugin' );
      // Included to test if peast correctly parses regexes containing a quote.
      // See: https://github.com/wp-cli/i18n-command/issues/98
      n = n.replace(/"/g, '&quot;');
      n = n.replace(/"|'/g, '&quot;');

      __( '__', 'foo-plugin' );
      _x( '_x', '_x_context', 'foo-plugin' );
      _n( '_n_single', '_n_plural', number, 'foo-plugin' );
      _nx( '_nx_single', '_nx_plural', number, '_nx_context', 'foo-plugin' );

      __( 'wrong-domain', 'wrong-domain' );

      __( 'Hello world' ); // translators: Greeting`

		const filename = 'filename.php'

		const result = doTree(content, filename)

		expect(result).toMatchSnapshot()
	})

	/** see wp cli tests */
	it('should extract translations and comments from code content', () => {
		const content = `<?php

      // translators: Foo Bar Comment
      __( 'Foo Bar', 'foo-plugin' );

      // TrANslAtORs: Bar Baz Comment
      __( 'Bar Baz', 'foo-plugin' );

      // translators: Software name
      const string = __( 'WordPress', 'foo-plugin' );

      // translators: So much space

      __( 'Spacey text', 'foo-plugin' );

      /* translators: Long comment
      spanning multiple
      lines */
      const string = __( 'Short text', 'foo-plugin' );

      ReactDOM.render(
        <h1>{__( 'Hello JSX', 'foo-plugin' )}</h1>,
        document.getElementById('root')
      );

      wp.i18n.__( 'wp.i18n.__', 'foo-plugin' );
      wp.i18n._n( 'wp.i18n._n_single', 'wp.i18n._n_plural', number, 'foo-plugin' );

      const translate = wp.i18n;
      translate.__( 'translate.__', 'foo-plugin' );

      Object(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__["__"])( 'webpack.__', 'foo-plugin' );
      Object(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_7__[/* __ */ "a"])( 'webpack.mangle.__', 'foo-plugin' );

      Object(u.__)( 'minified.__', 'foo-plugin' );
      Object(j._x)( 'minified._x', 'minified._x_context', 'foo-plugin' );

      /* translators: babel */
      (0, __)( 'babel.__', 'foo-plugin' );
      (0, _i18n.__)( 'babel-i18n.__', 'foo-plugin' );
      (0, _i18n._x)( 'babel-i18n._x', 'babel-i18n._x_context', 'foo-plugin' );

      eval( "__( 'Hello Eval World', 'foo-plugin' );" );

      __( \`This is a \${bug}\`, 'foo-plugin' );

      /**
       * Plugin Name: Plugin name
       */

      /* translators: Translators 1! */
      _e( 'hello world', 'foo-plugin' );

      /* Translators: Translators 2! */
      $foo = __( 'foo', 'foo-plugin' );

      /* translators: localized date and time format, see https://secure.php.net/date */
      __( 'F j, Y g:i a', 'foo-plugin' );

      // translators: let your ears fly!
      __( 'on', 'foo-plugin' );

      /*
       * Translators: If there are characters in your language that are not supported
       * by Lato, translate this to 'off'. Do not translate into your own language.
       */
       __( 'off', 'foo-plugin' );

      /* translators: this should get extracted. */ $foo = __( 'baba', 'foo-plugin' );

      /* translators: boo */ /* translators: this should get extracted too. */ /* some other comment */ $bar = g( __( 'bubu', 'foo-plugin' ) );

      {TAB}/*
      {TAB} * translators: this comment block is indented with a tab and should get extracted too.
      {TAB} */
      {TAB}__( 'yolo', 'foo-plugin' );

      /* translators: This is a comment */
      __( 'Plugin name', 'foo-plugin' );

      /* Translators: This is another comment! */
      __( 'https://example.com', 'foo-plugin' );
      `

		const filename = 'filename.php'

		const result = doTree(content, filename)

		expect(result).toMatchSnapshot()
	})
})
