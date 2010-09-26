var js_pp = require('js_pp').format;
var testCase = require('nodeunit').testCase;

function range ( low, high, step ) {
    // http://kevin.vanzonneveld.net
    // +   original by: Waldo Malqui Silva
    // *     example 1: range ( 0, 12 );
    // *     returns 1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    // *     example 2: range( 0, 100, 10 );
    // *     returns 2: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    // *     example 3: range( 'a', 'i' );
    // *     returns 3: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
    // *     example 4: range( 'c', 'a' );
    // *     returns 4: ['c', 'b', 'a']

    var matrix = [];
    var inival, endval, plus;
    var walker = step || 1;
    var chars  = false;

    if ( !isNaN( low ) && !isNaN( high ) ) {
        inival = low;
        endval = high;
    } else if ( typeof low === 'string' && typeof high === 'string' ) {
        chars = true;
        walker = Math.floor(walker);
        inival = low.charCodeAt( 0 );
        endval = high.charCodeAt( 0 );
    } else {
        inival = ( isNaN( low ) ? 0 : low );
        endval = ( isNaN( high ) ? 0 : high );
    }

    plus = ( ( inival > endval ) ? false : true );
    if ( plus ) {
        while ( inival <= endval ) {
            matrix.push( ( ( chars ) ? String.fromCharCode( inival ) : inival ) );
            inival += walker;
        }
    } else {
        while ( inival >= endval ) {
            matrix.push( ( ( chars ) ? String.fromCharCode( inival ) : inival ) );
            inival -= walker;
        }
    }

    return matrix;
}

module.exports = testCase({
    setUp: function () {
		this.options = {
			"semicolons": "all",
			"indentation": 2,
			"newline_before_closing_brace": true,
			"space_after_comma": true,
			"space_around_operators": true,
			"space_inside_parens": false,
			"number_radix": 10,
			"object_literal_comma_first": false,
			"blank_before_function": true,
			"space_inside_if_test_parens": false,
			"space_before_if_test": true,
			"space_after_single_line_if_test": true,
			"control_statement_braces": "preserve",
			"control_statement_empty": "empty-statement",
			"string_linebreak_style": "backslash-n",
			"string_charset": "utf-8"
		}
		// set up
    },
    tearDown: function () {
        // clean up
    },
    'test format single numbers': function (test) {
		var r = range( 0, 9 );
        test.equals(js_pp(this.options,r.join(';')), r.join(';\n')+';');
        test.done();
    },
	'test all single letter identifier': function (test) {
		var r = range( 'a', 'z' );
        test.equals(js_pp(this.options,r.join(';')), r.join(';\n')+';');
        test.done();
    },	
	'test addition': function (test) {
		var r = range(0,9).concat(range( 'a', 'z' ));
		test.equals(js_pp(this.options,r.join('+')), r.join(' + ')+';');
        test.done();
	},
	'test subtraction': function (test) {
		var r = range(0,9).concat(range( 'a', 'z' ));
		test.equals(js_pp(this.options,r.join('-')), r.join(' - ')+';');
        test.done();
	},
	'test multiplication': function (test) {
		var r = range(0,9).concat(range( 'a', 'z' ));
		test.equals(js_pp(this.options,r.join('*')), r.join(' * ')+';');
        test.done();
	},
	'test division': function (test) {
		var r = range(0,9).concat(range( 'a', 'z' ));
		test.equals(js_pp(this.options,r.join('/')), r.join(' / ')+';');
        test.done();
	},
	'test modulus': function (test) {
		var r = range(0,9).concat(range( 'a', 'z' ));
		test.equals(js_pp(this.options,r.join('%')), r.join(' % ')+';');
        test.done();
	},
    'test all artimetics (+-*/%)': function (test) {
        var r1 = range(0,9).concat(range( 'a', 'z' ));
        var r2 = ['+','-','*','/','%'];
        var idx1 = idx2 = 0, code = [];
        while( idx1 < r1.length ) {
            code.push(r1[idx1]);
            code.push(r2[idx2]);
            idx1++;
            idx2 = (idx2 + 1) % r2.length;
        }
        code.pop();
		test.equals(js_pp(this.options,code.join('')), code.join(' ')+';');
        test.done();
	}
});

