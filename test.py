from urllib3 import response
from tools.tavily_tool import tavily_search
from tools.flight_tools import search_flights
from backend import run_travel_agent

#print(tavily_search("What are the best hotels in Manali for couples"))
#print(search_flights("plan a 7 days trip to Nepal from India"))


user_input = input("Enter your travel query: ")

response = run_travel_agent(
    user_input=user_input,
    thread_id="test_thread",
)

print(response["answer"])


