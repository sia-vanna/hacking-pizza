#include <iostream>
#include <fstream>
#include <sstream>
#include <map>
#include <vector>
#include <algorithm>

struct Stats {
    int count = 0;
    double revenue = 0;
    double cost = 0;
};

int main(int argc, char* argv[]) {
    // args: file path OR stdin
    std::string filename = argc > 1? argv[1] : "";
    std::istream* in;
    std::ifstream file;

    if (!filename.empty() && filename!= "-") {
        file.open(filename);
        in = &file;
    } else {
        in = &std::cin;
    }

    std::map<std::string, Stats> byPizza;
    std::map<std::string, Stats> byHour;
    double totalRevenue = 0, totalCost = 0;
    int totalOrders = 0;

    // costs in C++ — real margins
    std::map<std::string, double> costs = {
        {"Pepperoni", 3.20}, {"Margherita", 2.10}, {"Hawaiian", 3.50},
        {"Veggie", 2.80}, {"Meat", 4.10}, {"Cheese", 1.90}
    };

    std::string line;
    bool first = true;
    while (std::getline(*in, line)) {
        if (first) { first = false; if(line.find("pizza")!=std::string::npos) continue; } // skip header
        if(line.empty()) continue;

        std::stringstream ss(line);
        std::string pizza, priceStr, hour;
        std::getline(ss, pizza, ',');
        std::getline(ss, priceStr, ',');
        std::getline(ss, hour, ',');

        double price = priceStr.empty()? 16.99 : std::stod(priceStr);
        double cost = costs.count(pizza)? costs[pizza] : 3.00;

        byPizza[pizza].count++;
        byPizza[pizza].revenue += price;
        byPizza[pizza].cost += cost;

        byHour[hour].count++;

        totalRevenue += price;
        totalCost += cost;
        totalOrders++;
    }

    // find best seller
    std::string best = "";
    int bestCount = 0;
    for(auto &p : byPizza) if(p.second.count > bestCount) { bestCount = p.second.count; best = p.first; }

    double profit = totalRevenue - totalCost;
    double margin = totalRevenue > 0? (profit/totalRevenue)*100 : 0;

    // JSON output for JS
    std::cout << "{";
    std::cout << "\"totalOrders\":" << totalOrders << ",";
    std::cout << "\"totalRevenue\":" << totalRevenue << ",";
    std::cout << "\"totalCost\":" << totalCost << ",";
    std::cout << "\"profit\":" << profit << ",";
    std::cout << "\"margin\":" << margin << ",";
    std::cout << "\"bestSeller\":\"" << best << "\",";

    std::cout << "\"byPizza\":{";
    bool firstP = true;
    for(auto &p : byPizza) {
        if(!firstP) std::cout << ",";
        std::cout << "\"" << p.first << "\":{\"count\":" << p.second.count << ",\"revenue\":" << p.second.revenue << ",\"profit\":" << (p.second.revenue - p.second.cost) << "}";
        firstP = false;
    }
    std::cout << "}";
    std::cout << "}";
    return 0;
}