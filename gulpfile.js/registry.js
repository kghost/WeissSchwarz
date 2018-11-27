function TasksRegistry() {}

TasksRegistry.prototype.init = function init(taker) {};

TasksRegistry.prototype.get = function(taskname) {
	const [ns, ...args] = taskname.split(':')
	retrun require(`./${ns}/index.js`).apply(null, args)
};

TasksRegistry.prototype.set = function set(name, fn) {
	throw "Not implemented"
};

TasksRegistry.prototype.tasks = function tasks() {
	return {}
};

module.exports = new TasksRegistry();
