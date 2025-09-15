"""Quick test for agent_api and agent_logger."""
from agent_api import list_threads, recommend_expansions, read_last_run
from agent_logger import AgentLogger

def run_test():
    print('threads:', list_threads())
    # show expansions for first thread if any
    threads = list_threads()
    if threads:
        first = threads[0]
        print('recommend_expansions(%s):' % first, recommend_expansions(first))
    print('last_run:', read_last_run())

    logger = AgentLogger('agent-test')
    logger.log(session=None, action='test-log', details={'note':'this is a test'}, extra={'from':'agent_api_test'})
    print('Wrote sample log entry to runtime/logs')

if __name__ == '__main__':
    run_test()
