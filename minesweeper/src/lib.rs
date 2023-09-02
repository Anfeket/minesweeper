use js_sys::Array;
use rand::Rng;
use wasm_bindgen::prelude::*;
use chrono::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}
#[allow(unused_macros)]
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen(getter_with_clone)]
pub struct Minefield {
    width: usize,
    height: usize,
    mines: usize,
    minefield: Vec<bool>,
    minemap: Vec<u8>,
    visible: Vec<bool>,
    turns: usize,
    flags: Vec<bool>,
    pub engine: Engine,
}

fn current_time_millis() -> usize {
    let now = Utc::now().timestamp_millis();
    now as usize
}

#[wasm_bindgen]
impl Minefield {
    pub fn new(width: usize, height: usize, mines: usize) -> Minefield {
        console_error_panic_hook::set_once();
        let total = width * height;
        let mut minefield = vec![false; total];
        let mut rng = rand::thread_rng();
        let mut mines_placed = 0;
        while mines_placed < mines {
            let index = rng.gen_range(0..total);
            if !minefield[index] {
                minefield[index] = true;
                mines_placed += 1;
            }
        }
        let mut minemap = vec![0; total];
        for i in 0..total {
            let mut count = 0;
            let x = i % width;
            let y = i / width;
            if x > 0 && y > 0 && minefield[i - width - 1] {
                count += 1;
            }
            if y > 0 && minefield[i - width] {
                count += 1;
            }
            if x < width - 1 && y > 0 && minefield[i - width + 1] {
                count += 1;
            }
            if x > 0 && minefield[i - 1] {
                count += 1;
            }
            if x < width - 1 && minefield[i + 1] {
                count += 1;
            }
            if x > 0 && y < height - 1 && minefield[i + width - 1] {
                count += 1;
            }
            if y < height - 1 && minefield[i + width] {
                count += 1;
            }
            if x < width - 1 && y < height - 1 && minefield[i + width + 1] {
                count += 1;
            }
            minemap[i] = count;
        }
        let visible = vec![false; total];
        let turns = 0;
        let flags = vec![false; total];
        let engine = Engine::new(mines);
        Minefield {
            width,
            height,
            mines,
            minefield,
            minemap,
            visible,
            turns,
            flags,
            engine,
        }
    }
    pub fn gen_loop(&mut self, col: usize, row: usize, mut i: usize) -> usize {
        if self.minemap_at(col, row) == 0 {
            return i;
        }
        let minefield = Minefield::new(self.width, self.height, self.mines);
        self.minefield = minefield.minefield;
        self.minemap = minefield.minemap;
        self.visible = minefield.visible;
        self.turns = 0;
        i += 1;
        Minefield::gen_loop(self, col, row, i)
    }
    pub fn length(&self) -> usize {
        self.minefield.len()
    }
    pub fn mine_at(&self, col: usize, row: usize) -> bool {
        self.minefield[row * self.width + col]
    }
    pub fn mine_index(&self, index: usize) -> bool {
        self.minefield[index]
    }
    pub fn width(&self) -> usize {
        self.width
    }
    pub fn height(&self) -> usize {
        self.height
    }
    pub fn cells(&self) -> Array {
        self.minefield.iter().map(|&x| JsValue::from(x)).collect()
    }
    pub fn minemap(&self) -> Array {
        self.minemap.iter().map(|&x| JsValue::from(x)).collect()
    }
    pub fn minemap_at(&self, col: usize, row: usize) -> u8 {
        self.minemap[row * self.width + col]
    }
    pub fn visible(&self) -> Array {
        self.visible.iter().map(|&x| JsValue::from(x)).collect()
    }
    pub fn visible_at(&self, col: usize, row: usize) -> bool {
        self.visible[row * self.width + col]
    }
    pub fn reveal(&mut self, col: usize, row: usize) -> Array {
        let mut queue = vec![(row, col)];
        fn check(width: usize, height: usize, row: usize, col: usize, minefield: &Minefield) -> bool {
            if row < height && col < width {
                if Minefield::visible_at(minefield, col, row) {
                    return false;
                }
                if Minefield::flag_at(minefield, col, row) {
                    return false;
                }
                return true;
            }
            return false;
        }
        let mut dvisible = 0;
        while let Some((row, col)) = queue.pop() {
            self.visible[row * self.width + col] = true;
            if (self.minemap_at(col, row) == 0) || (self.nearby_flags(row, col) == self.minemap_at(col, row)) {
                if check(self.width, self.height, row + 1, col - 1, self) {
                    queue.push((row + 1, col - 1));
                }
                if check(self.width, self.height, row + 1, col, self) {
                    queue.push((row + 1, col));
                }
                if check(self.width, self.height, row + 1, col + 1, self) {
                    queue.push((row + 1, col + 1));
                }
                if check(self.width, self.height, row, col - 1, self) {
                    queue.push((row, col - 1));
                }
                if check(self.width, self.height, row, col + 1, self) {
                    queue.push((row, col + 1));
                }
                if check(self.width, self.height, row - 1, col - 1, self) {
                    queue.push((row - 1, col - 1));
                    dvisible += 1;
                }
                if check(self.width, self.height, row - 1, col, self) {
                    queue.push((row - 1, col));
                    dvisible += 1;
                }
                if check(self.width, self.height, row - 1, col + 1, self) {
                    queue.push((row - 1, col + 1));
                    dvisible += 1;
                }
                if self.minemap_at(col, row) != 0 {
                    dvisible += 1;
                }
            }
        }
        self.increment_turns();
        self.nearby_flags(row, col);
        if self.engine.times.is_empty() {
            self.engine.times.push(current_time_millis() as usize);
        } else {
            let time = current_time_millis() as usize - self.engine.time();
            self.engine.add_move(dvisible, time);
        }
        return self.visible.iter().map(|&x| JsValue::from(x)).collect();
    }
    pub fn turns(&self) -> usize {
        self.turns
    }
    fn increment_turns(&mut self) {
        self.turns += 1;
    }
    pub fn is_finished(&self) -> bool {
        let hidden = self.visible.iter().filter(|&&x| !x).count();
        hidden == self.mines
    }
    pub fn xy_to_index(&self, col: usize, row: usize) -> usize {
        row * self.width + col
    }
    pub fn index_to_xy(&self, index: usize) -> Array {
        let x = index % self.width;
        let y = index / self.width;
        return [x, y].iter().map(|&x| JsValue::from(x)).collect();
    }
    pub fn flag(&mut self, col: usize, row: usize) {
        let index = self.xy_to_index(col, row);
        self.flags[index] = !self.flags[index];
    }
    pub fn flag_at(&self, col: usize, row: usize) -> bool {
        let index = self.xy_to_index(col, row);
        self.flags[index]
    }
    pub fn flags(&self) -> Array {
        self.flags.iter().map(|&x| JsValue::from(x)).collect()
    }
    pub fn nearby_flags(&self, row: usize, col: usize) -> u8 {
        let mut count = 0;
        if row > 0 && col > 0 && self.flag_at(col - 1, row - 1) {
            count += 1;
        }
        if row > 0 && self.flag_at(col, row - 1) {
            count += 1;
        }
        if row > 0 && col < self.width - 1 && self.flag_at(col + 1, row - 1) {
            count += 1;
        }
        if col > 0 && self.flag_at(col - 1, row) {
            count += 1;
        }
        if col < self.width - 1 && self.flag_at(col + 1, row) {
            count += 1;
        }
        if row < self.height - 1 && col > 0 && self.flag_at(col - 1, row + 1) {
            count += 1;
        }
        if row < self.height - 1 && self.flag_at(col, row + 1) {
            count += 1;
        }
        if row < self.height - 1 && col < self.width - 1 && self.flag_at(col + 1, row + 1) {
            count += 1;
        }
        count
    }
}

#[wasm_bindgen]
#[derive(Clone)]
pub struct Engine {
    score: usize,
    dvisible: Vec<usize>,
    times: Vec<usize>,
    mines: usize,
    turns: usize,
}

#[wasm_bindgen]
impl Engine {
    pub fn new(mines: usize) -> Engine {
        Engine {
            score: 0,
            dvisible: vec![],
            times: vec![],
            mines,
            turns: 0,
        }
    }
    pub fn score(&mut self) -> usize {
        self.score
    }
    pub fn get_scores(&self) -> Array {
        self.evaluate().iter().map(|&x| JsValue::from(x)).collect()
    }
    pub fn add_move(&mut self, visible: usize, time: usize) {
        self.dvisible.push(visible);
        self.times.push(time);
        self.turns += 1;
        self.score += self.evaluate()[0];
    }
    fn evaluate(&self) -> Vec<usize> {
        let time_score = (10000 / self.times.last().unwrap()) * 10;
        let move_score = self.dvisible.last().unwrap_or(&0) * self.mines; 
        let nerf = self.turns * 10;
        if time_score == 0 || move_score == 0 {
            return vec![0, 0, 0, 0];
        }
        let score = time_score * move_score - nerf;
        vec![score, time_score, move_score, nerf]
    }
    pub fn times(&self) -> Array {
        self.times.iter().map(|&x| JsValue::from(x)).collect()
    }
    pub fn time(&self) -> usize {
        self.times.iter().sum()
    }
}