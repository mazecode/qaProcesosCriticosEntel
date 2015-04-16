@extends('layouts.scaffold')

@section('main')

	<h1>Show Post</h1>

	<p>{{ link_to_route('posts.index', 'Return to All posts', null, array('class'=>'btn btn-lg btn-primary')) }}</p>

	<table class="table table-striped">
		<thead>
		<tr>
			<th>Title</th>
			<th>Body</th>
		</tr>
		</thead>

		<tbody>
		<tr>
			<td>{{{ $post->title }}}</td>
			<td>{{{ $post->body }}}</td>
			<td>
				{{ Form::open(array('style' => 'display: inline-block;', 'method' => 'DELETE', 'route' => array('posts.destroy', $post->id))) }}
				{{ Form::submit('Delete', array('class' => 'btn btn-danger')) }}
				{{ Form::close() }}
				{{ link_to_route('posts.edit', 'Edit', array($post->id), array('class' => 'btn btn-info')) }}
			</td>
		</tr>
		</tbody>
	</table>

@stop
