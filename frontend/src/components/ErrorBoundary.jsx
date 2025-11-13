import { Component } from 'react';

export default class ErrorBoundary extends Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(err) {
		console.error('UI ErrorBoundary:', err);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="card">
					<h3 className="text-lg font-semibold mb-2">Something went wrong.</h3>
					<p className="text-sm text-gray-500">Please refresh the page and try again.</p>
				</div>
			);
		}
		return this.props.children;
	}
}

