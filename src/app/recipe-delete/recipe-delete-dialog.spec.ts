import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteRecipeDialog } from './delete-recipe-dialog';
import { HarnessLoader } from '@angular/cdk/testing';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { Recipe } from '../types/recipe';
import { Component } from '@angular/core';

@Component({
  selector: 'test-component',
  template: '',
})
class DeleteRecipeTestComponent {
  constructor(private readonly dialog: MatDialog) {}

  open(config: MatDialogConfig) {
    this.dialog.open(DeleteRecipeDialog, config);
  }
}

describe('RecipeDeleteDialog', () => {
  let fixture: ComponentFixture<DeleteRecipeTestComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeleteRecipeTestComponent, DeleteRecipeDialog],
      imports: [BrowserModule, MatDialogModule, MatSnackBarModule, NoopAnimationsModule],
    }).compileComponents();
    fixture = TestBed.createComponent(DeleteRecipeTestComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  });

  it('should load harness for dialog', async () => {
    const recipe = new Recipe('title', 'desc', [], [], []);
    fixture.componentInstance.open({ data: recipe });
    const dialogs = await loader.getAllHarnesses(MatDialogHarness);
    expect(dialogs.length).toBe(1);
  });

  // TODO test the cancel button
  // TODO test the ok button
});
