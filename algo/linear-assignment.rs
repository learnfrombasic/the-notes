/*
    *The implementation of Hungarian Algorithm 
    @keywords: linear assignment.
    @author: Minh Le Duc 
    @date: 2025-05-02

    
*/

// Hungarian Algorithm đơn giản cho ma trận vuông
fn hungarian_algo(cost: Vec<Vec<i32>>) -> (Vec<usize>, i32) {
    let n = cost.len();
    let mut u = vec![0; n + 1]; // Nhãn (label) cho hàng (người)
    let mut v = vec![0; n + 1]; // Nhãn (label) cho cột (việc)
    let mut p = vec![0; n + 1]; // p[j]: hàng (người) nào đang được gán cho cột (việc) j
    let mut way = vec![0; n + 1]; // Dùng để backtrack đường đi    

    for i in 1..=n {
        println!("Checking ");
        let mut minv = vec![i32::MAX; n + 1];
        let mut used = vec![false; n + 1];
        p[0] = i;
        let mut j0 = 0;

        loop {
            used[j0] = true;
            let i0 = p[j0];
            let mut delta = i32::MAX;
            let mut j1 = 0;

            for j in 1..=n {
                if !used[j] {
                    let cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
                    if cur < minv[j] {
                        minv[j] = cur;
                        way[j] = j0;
                    }
                    if minv[j] < delta {
                        delta = minv[j];
                        j1 = j;
                    }
                }
            }

            for j in 0..=n {
                if used[j] {
                    u[p[j]] += delta;
                    v[j] -= delta;
                } else {
                    minv[j] -= delta;
                }
            }

            j0 = j1;
            if p[j0] == 0 {
                break;
            }
        }

        loop {
            let j1 = way[j0];
            p[j0] = p[j1];
            j0 = j1;
            if j0 == 0 {
                break;
            }
        }
    }

    // Gán công việc: result[i - 1] là công việc gán cho người i-1
    let mut result = vec![0; n];
    for j in 1..=n {
        result[p[j] - 1] = j - 1;
    }

    let total_cost = -v[0];
    (result, total_cost)
}

fn main() {
    let cost_matrix = vec![
        vec![9, 2, 7],
        vec![6, 4, 3],
        vec![5, 8, 1],
    ];

    let (assignment, total_cost) = hungarian_algo(cost_matrix);

    println!("Gán công việc: {:?}", assignment);
    println!("Tổng chi phí tối thiểu: {}", total_cost);
}


/*
    Simple implementation
    ```
    [dependencies]
    kuhn_munkres = "0.1.0"
    ```

    use kuhn_munkres::Minimize;
    use kuhn_munkres::kuhn_munkres;

    fn main() {
        // Ma trận chi phí: cost[i][j] là chi phí gán công việc j cho người i
        let cost_matrix = vec![
            vec![9, 2, 7],
            vec![6, 4, 3],
            vec![5, 8, 1],
        ];

        // Tìm ánh xạ sao cho tổng chi phí là nhỏ nhất
        let result = kuhn_munkres(&cost_matrix, Minimize);

        println!("Tổng chi phí tối thiểu: {}", result.total_cost);
        println!("Ánh xạ gán (người -> công việc): {:?}", result.assignment);
    }

*/