import { test } from 'qunit';

test( 'Cannot use append and enhance at the same time', t => {
	t.throws( () => {
		new Ractive({
			enhance: true,
			append: true
		});
	}, /Cannot use append and enhance at the same time/ );
});

test( 'basic progressive enhancement', t => {
	fixture.innerHTML = '<p></p>';
	const p = fixture.querySelector( 'p' );

	const ractive = new Ractive({
		el: fixture,
		template: '<p></p>',
		enhance: true
	});

	t.htmlEqual( fixture.innerHTML, '<p></p>' );
	t.strictEqual( p, ractive.find( 'p' ) );
});

test( 'missing nodes are added', t => {
	fixture.innerHTML = '<p></p>';
	const p = fixture.querySelector( 'p' );

	const ractive = new Ractive({
		el: fixture,
		template: '<p></p><p></p>',
		enhance: true
	});

	t.htmlEqual( fixture.innerHTML, '<p></p><p></p>' );
	t.strictEqual( p, ractive.find( 'p' ) );
});

test( 'excess nodes are removed', t => {
	fixture.innerHTML = '<p></p><p></p>';
	const ps = fixture.querySelectorAll( 'p' );

	const ractive = new Ractive({
		el: fixture,
		template: '<p></p>',
		enhance: true
	});

	t.htmlEqual( fixture.innerHTML, '<p></p>' );
	t.strictEqual( ps[0], ractive.find( 'p' ) );
	t.ok( ps[1].parentNode !== fixture );
});

test( 'nested elements', t => {
	const html = '<div><p><strong>it works!</strong></p></div>';
	fixture.innerHTML = html;

	const div = fixture.querySelector( 'div' );
	const p = fixture.querySelector( 'p' );
	const strong = fixture.querySelector( 'strong' );

	const ractive = new Ractive({
		el: fixture,
		template: html,
		enhance: true
	});

	t.htmlEqual( fixture.innerHTML, html );
	t.strictEqual( div, ractive.find( 'div' ) );
	t.strictEqual( p, ractive.find( 'p' ) );
	t.strictEqual( strong, ractive.find( 'strong' ) );
});

test( 'attributes are added/removed as appropriate', t => {
	fixture.innerHTML = '<button disabled data-live="false"></button>';
	const button = fixture.querySelector( 'button' );

	const ractive = new Ractive({
		el: fixture,
		template: '<button class="live"></button>',
		enhance: true
	});

	t.htmlEqual( fixture.innerHTML, '<button class="live"></button>' );
	t.strictEqual( button, ractive.find( 'button' ) );
	t.ok( !button.disabled );
});

test( 'attributes are removed if none exist in template', t => {
	fixture.innerHTML = `<button disabled>don't click me</button>`;
	const button = fixture.querySelector( 'button' );

	const ractive = new Ractive({
		el: fixture,
		template: '<button>do click me</button>',
		enhance: true
	});

	t.htmlEqual( fixture.innerHTML, '<button>do click me</button>' );
	t.strictEqual( button, ractive.find( 'button' ) );
	t.ok( !button.disabled );
});

test( 'conditional sections inherit existing DOM', t => {
	fixture.innerHTML = '<p></p>';
	const p = fixture.querySelector( 'p' );

	const ractive = new Ractive({
		el: fixture,
		template: '{{#if foo}}<p></p>{{/if}}',
		data: { foo: true },
		enhance: true
	});

	t.htmlEqual( fixture.innerHTML, '<p></p>' );
	t.strictEqual( p, ractive.find( 'p' ) );
});

test( 'list sections inherit existing DOM', t => {
	fixture.innerHTML = '<ul><li>a</li><li>b</li><li>c</li></ul>';
	const lis = fixture.querySelectorAll( 'li' );

	const ractive = new Ractive({
		el: fixture,
		template: `
			<ul>
				{{#each items}}<li>{{this}}</li>{{/each}}
			</ul>
		`,
		data: { items: [ 'a', 'b', 'c' ] },
		enhance: true
	});

	t.htmlEqual( fixture.innerHTML, '<ul><li>a</li><li>b</li><li>c</li></ul>' );
	t.deepEqual( ractive.findAll( 'li' ), [].slice.call( lis ) );
});

test( 'interpolator in text sandwich', t => {
	fixture.innerHTML = '<p>before</p> hello, world! <p>after</p>';
	const ps = fixture.querySelectorAll( 'p' );

	const ractive = new Ractive({
		el: fixture,
		template: `<p>before</p> hello, {{name}}! <p>after</p>`,
		data: { name: 'world' },
		enhance: true
	});

	t.htmlEqual( fixture.innerHTML, '<p>before</p> hello, world! <p>after</p>' );
	t.deepEqual( ractive.findAll( 'p' ), [].slice.call( ps ) );
});

test( 'mismatched interpolator in text sandwich', t => {
	fixture.innerHTML = '<p>before</p> hello, world! <p>after</p>';
	const ps = fixture.querySelectorAll( 'p' );

	const ractive = new Ractive({
		el: fixture,
		template: `<p>before</p> hello, {{name}}! <p>after</p>`,
		data: { name: 'everybody' },
		enhance: true
	});

	t.htmlEqual( fixture.innerHTML, '<p>before</p> hello, everybody! <p>after</p>' );
	t.deepEqual( ractive.findAll( 'p' ), [].slice.call( ps ) );
});

test( 'partials', t => {
	fixture.innerHTML = '<p>I am a partial</p>';
	const p = fixture.querySelector( 'p' );

	const ractive = new Ractive({
		el: fixture,
		template: '{{>foo}}',
		partials: {
			foo: '<p>I am a partial</p>'
		},
		enhance: true
	});

	t.htmlEqual( fixture.innerHTML, '<p>I am a partial</p>' );
	t.strictEqual( ractive.find( 'p' ), p );
});

test( 'components', t => {
	fixture.innerHTML = '<ul><li>apples</li><li>oranges</li></ul>';
	const lis = fixture.querySelectorAll( 'li' );

	const Item = Ractive.extend({
		template: '<li>{{name}}</li>'
	});

	const ractive = new Ractive({
		el: fixture,
		components: { Item },
		template: `
			<ul>
				{{#each items}}<Item name='{{this}}'/>{{/each}}
			</ul>`,
		data: { items: [ 'apples', 'oranges' ] },
		enhance: true
	});

	t.htmlEqual( fixture.innerHTML, '<ul><li>apples</li><li>oranges</li></ul>' );
	t.deepEqual( ractive.findAll( 'li' ), [].slice.call( lis ) );
});

test( 'two-way binding is initialised from DOM', t => {
	fixture.innerHTML = '<input type="number" value="42"/>';
	const input = fixture.querySelector( 'input' );

	const ractive = new Ractive({
		el: fixture,
		template: '<input type="number" value="{{answer}}"/>',
		enhance: true
	});

	t.equal( ractive.get( 'answer' ), 42 );
	t.strictEqual( ractive.find( 'input' ), input );
});