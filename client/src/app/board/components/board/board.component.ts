import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { BoardsService } from 'src/app/shared/services/boards.service';
import { BoardService } from '../../services/board.service';
import { Observable, combineLatest, filter, map } from 'rxjs';
import { BoardInterface } from 'src/app/shared/types/board.interface';
import { SocketService } from 'src/app/shared/services/socket.service';
import { SocketEventsEnum } from 'src/app/shared/types/socketEvents.enum';
import { ColumnsService } from 'src/app/shared/services/columns.service';
import { ColumnInterface } from 'src/app/shared/types/column.interface';
import { ColumnInputInterface } from 'src/app/shared/types/columnInput.interface';
import { TaskInterface } from 'src/app/shared/types/task.interface';
import { TasksService } from 'src/app/shared/services/tasks.service';
import { TaskInputInterface } from 'src/app/shared/types/taskInput.interface';

@Component({
  selector: 'board',
  templateUrl: './board.component.html',
})
export class BoardComponent implements OnInit {
  boardId: string;
  data$: Observable<{
    board: BoardInterface;
    columns: ColumnInterface[];
    tasks: TaskInterface[];
  }>;

  constructor(
    private boardsService: BoardsService,
    private route: ActivatedRoute,
    private router: Router,
    private boardService: BoardService,
    private socketService: SocketService,
    private columnsService: ColumnsService,
    private tasksService: TasksService
  ) {
    const boardId = this.route.snapshot.paramMap.get('boardId');

    if (!boardId) {
      throw new Error('Cant get boardId from url');
    }

    this.boardId = boardId;
    this.data$ = combineLatest([
      this.boardService.board$.pipe(filter(Boolean)),
      this.boardService.column$,
      this.boardService.tasks$,
    ]).pipe(map(([board, columns, tasks]) => ({ board, columns, tasks })));
  }

  ngOnInit(): void {
    this.socketService.emit(SocketEventsEnum.boardsJoin, {
      boardId: this.boardId,
    });
    this.fetchData();
    this.initializeListeners();
  }

  initializeListeners(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        console.log('leaving a page');
        this.boardService.leaveBoard(this.boardId);
      }
    });

    this.socketService
      .listen<ColumnInterface>(SocketEventsEnum.columnsCreateSuccess)
      .subscribe((column) => {
        // console.log('column', column);
        this.boardService.addColumn(column);
      });

    this.socketService
      .listen<TaskInterface>(SocketEventsEnum.tasksCreateSuccess)
      .subscribe((task) => {
        // console.log('column', column);
        this.boardService.addTask(task);
      });

    this.socketService
      .listen<BoardInterface>(SocketEventsEnum.boardsUpdateSuccess)
      .subscribe((updateBoard) => {
        // console.log('column', column);
        this.boardService.updateBoard(updateBoard);
      });
  }

  fetchData(): void {
    this.boardsService.getBoard(this.boardId).subscribe((board) => {
      // console.log('board', board);
      this.boardService.setBoard(board);
    });

    this.columnsService.getColumns(this.boardId).subscribe((columns) => {
      // console.log('columns', columns);
      this.boardService.setColumns(columns);
    });

    this.tasksService.getTasks(this.boardId).subscribe((tasks) => {
      // console.log('columns', columns);
      this.boardService.setTasks(tasks);
    });
  }

  createColumn(title: string): void {
    // console.log('createColumn', title);
    const columnInput: ColumnInputInterface = {
      title,
      boardId: this.boardId,
    };
    this.columnsService.createColumn(columnInput);
  }

  createTask(title: string, columnId: string): void {
    // console.log('createColumn', title);
    const taskInput: TaskInputInterface = {
      title,
      boardId: this.boardId,
      columnId,
    };
    this.tasksService.createTask(taskInput);
  }

  getTasksByColumn(columnId: string, tasks: TaskInterface[]): TaskInterface[] {
    return tasks.filter((task) => task.columnId === columnId);
  }

  updateBoardName(boardName: string): void {
    this.boardsService.updateBoard(this.boardId, { title: boardName });
  }
}
